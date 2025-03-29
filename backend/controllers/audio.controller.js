const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const FormData = require("form-data");
const streamifier = require("streamifier");
const { PassThrough } = require("stream");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Process audio file - upload to Cloudinary, process, analyze, and translate
 */
exports.processAudio = async (req, res) => {
  try {
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No audio file uploaded",
      });
    }

    console.log("File received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      // Don't log the entire buffer
    });

    const { srcLang, tgtLang } = req.body;

    console.log("Languages:", { srcLang, tgtLang });

    if (!srcLang || !tgtLang) {
      return res.status(400).json({
        success: false,
        message: "Source and target languages are required",
      });
    }

    // Upload raw audio to Cloudinary
    console.log("Uploading to Cloudinary...");
    const rawAudioUrl = await uploadToCloudinary(req.file.buffer, "raw");
    console.log("Uploaded to Cloudinary:", rawAudioUrl);

    // Apply audio processing via Cloudinary transformations
    const processedAudioUrl = getProcessedAudioUrl(rawAudioUrl);
    console.log("Processed audio URL:", processedAudioUrl);

    // Download processed audio for analysis
    console.log("Downloading processed audio...");
    const processedAudioBuffer = await downloadFromCloudinary(
      processedAudioUrl
    );
    console.log(
      "Downloaded processed audio, size:",
      processedAudioBuffer.length
    );

    // Analyze audio for speech detection
    console.log("Analyzing for speech...");
    const hasSpeech = await analyzeAudioForSpeech(processedAudioBuffer);
    console.log("Speech detected:", hasSpeech);

    if (!hasSpeech) {
      // Clean up Cloudinary resources
      await deleteCloudinaryResource(rawAudioUrl);

      return res.status(200).json({
        success: true,
        transcribed_text: "",
        translated_text: "",
        message: "No speech detected in the audio",
      });
    }

    // Send processed audio to external NLP service
    console.log("Sending to NLP service...");
    const result = await sendToNLPService(
      processedAudioBuffer,
      srcLang,
      tgtLang
    );
    console.log("NLP service response:", result);

    // Clean up Cloudinary resources
    await deleteCloudinaryResource(rawAudioUrl);

    return res.status(200).json({
      success: true,
      transcribed_text: result.transcribed_text || "",
      translated_text: result.translated_text || "",
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    // Send more detailed error information
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process audio",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Upload audio buffer to Cloudinary
 */
async function uploadToCloudinary(buffer, resourceType = "auto") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "audio-processing",
        format: "webm",
        // Set expiration time to 1 hour
        timestamp: Math.round(new Date().getTime() / 1000) + 3600,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Get URL for processed audio using Cloudinary transformations
 */
function getProcessedAudioUrl(originalUrl) {
  // Extract public ID from the original URL
  const urlParts = originalUrl.split("/");
  const publicIdWithExt = urlParts[urlParts.length - 1];
  const publicId = publicIdWithExt.split(".")[0];
  const folder = urlParts[urlParts.length - 2];

  // Create a transformation URL that applies audio processing
  // Note: Limited audio transformations are available in Cloudinary
  // Most advanced processing will need to happen after download
  return cloudinary.url(`${folder}/${publicId}`, {
    resource_type: "video", // Cloudinary uses 'video' for audio files too
    format: "webm",
    // Basic audio enhancements
    effect: "volume:150",
  });
}

/**
 * Download file from Cloudinary
 */
async function downloadFromCloudinary(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
}

/**
 * Delete a resource from Cloudinary
 */
async function deleteCloudinaryResource(url) {
  try {
    // Extract public ID from the URL
    const urlParts = url.split("/");
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExt.split(".")[0];
    const folder = urlParts[urlParts.length - 2];

    await cloudinary.uploader.destroy(`${folder}/${publicId}`, {
      resource_type: "raw",
    });
  } catch (error) {
    console.error("Error deleting Cloudinary resource:", error);
    // Continue execution even if cleanup fails
  }
}

/**
 * Analyze audio buffer for speech detection using ffmpeg
 */
async function analyzeAudioForSpeech(audioBuffer) {
  return new Promise((resolve, reject) => {
    const passThrough = new PassThrough();
    passThrough.end(audioBuffer);

    let silenceInfo = "";
    let audioDuration = 0;

    ffmpeg()
      .input(passThrough)
      .audioFilters("silencedetect=noise=-30dB:d=0.5")
      .format("null")
      .on("error", (err) => {
        console.error("Error analyzing audio:", err);
        resolve(false); // Assume no speech on error
      })
      .on("stderr", (stderrLine) => {
        // Collect silence detection info from stderr
        silenceInfo += stderrLine + "\n";

        // Extract duration information
        const durationMatch = stderrLine.match(
          /Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/
        );
        if (durationMatch) {
          audioDuration =
            parseInt(durationMatch[1]) * 3600 +
            parseInt(durationMatch[2]) * 60 +
            parseInt(durationMatch[3]) +
            parseInt(durationMatch[4]) / 100;
        }
      })
      .on("end", () => {
        try {
          // Parse silence information
          const silenceMatches =
            silenceInfo.match(/silence_duration: [\d\.]+/g) || [];

          // Extract total silence duration
          let silenceDuration = 0;
          silenceMatches.forEach((match) => {
            const duration = parseFloat(match.split(": ")[1]);
            silenceDuration += duration;
          });

          // If we have silence detections but couldn't determine duration,
          // we know there's some audio
          if (audioDuration === 0 && silenceMatches.length > 0) {
            resolve(true);
            return;
          }

          // If we have neither duration nor silence detections,
          // we can't determine if there's speech
          if (audioDuration === 0 && silenceMatches.length === 0) {
            // Conservative approach: resolve true to avoid false negatives
            resolve(true);
            return;
          }

          // Calculate speech percentage
          const speechDuration = audioDuration - silenceDuration;
          const speechPercentage = (speechDuration / audioDuration) * 100;

          // Consider it speech if at least 15% of the audio is non-silence
          resolve(speechPercentage >= 15);
        } catch (err) {
          console.error("Error analyzing silence data:", err);
          resolve(true); // Default to true on error to avoid false negatives
        }
      })
      .output("/dev/null") // Output is discarded
      .run();
  });
}

/**
 * Send processed audio to the NLP service for transcription and translation
 */
async function sendToNLPService(audioBuffer, srcLang, tgtLang) {
  try {
    // Create a form data for the API request
    const formData = new FormData();

    // Append file to form
    formData.append("file", audioBuffer, {
      filename: `processed-audio-${Date.now()}.webm`,
      contentType: "audio/webm",
    });

    // Append language parameters
    formData.append("srcLang", srcLang);
    formData.append("tgtLang", tgtLang);

    // Replace this URL with your actual NLP service API endpoint
    const NLP_API_URL = process.env.NLP_API_URL;
    console.log("Sending to NLP service at:", NLP_API_URL);

    const response = await axios.post(NLP_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        Accept: "application/json",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log("NLP service response status:", response.status);
    console.log("NLP service response data:", response.data);

    return {
      transcribed_text: response.data.transcribed_text || "",
      translated_text: response.data.translated_text || "",
    };
  } catch (error) {
    console.error("Error sending to NLP service:", error);
    if (axios.isAxiosError(error)) {
      console.error("NLP service error response:", error.response?.data);
    }
    throw new Error("Failed to process audio with NLP service");
  }
}
