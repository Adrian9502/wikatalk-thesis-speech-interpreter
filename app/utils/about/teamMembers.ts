import { TeamMember } from "@/types/teamMebersTypes";
// Team members data
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "John Adrian Bonto",
    role: "Full Stack Developer",
    bio: "Responsible for the full development of the mobile application using React Native, Express.js and MongoDB. Tasks included user interface design, back-end integration, API implementation, and overall system architecture.",
    image: require("@/assets/team/johnadrianbonto.jpg"),
    socialLinks: [
      { type: "github", url: "https://github.com/Adrian9502" },
      {
        type: "linkedin",
        url: "https://www.linkedin.com/in/john-adrian-bonto-a65704283/",
      },
      {
        type: "mail",
        url: "mailto:bontojohnadrian@gmail.com",
      },
      { type: "facebook", url: "https://www.facebook.com/john.adrian.bonto" },
    ],
  },
  {
    id: 2,
    name: "Ronald Curzon",
    role: "NLP Engineer / Machine Learning Specialist",
    bio: "In charge of training and fine-tuning the Natural Language Processing model using Hugging Face and Google Colab. Also contributed to the mobile application’s development through collaborative implementation and version control via GitHub.",
    image: require("@/assets/team/ronald.png"),
    socialLinks: [
      { type: "facebook", url: "https://www.facebook.com/rbcurzon" },
      {
        type: "linkedin",
        url: "https://www.linkedin.com/in/ronald-curzon-928250309",
      },
      {
        type: "mail",
        url: "mailto:curzonronald@gmail.com",
      },
      { type: "github", url: "https://github.com/rbcurzon" },
    ],
  },
  {
    id: 3,
    name: "Hannie Edrielle Marababol",
    role: "Research & Documentation Lead",
    bio: "Primary author of the thesis manuscript. Oversaw the formulation of the research framework, literature review, and methodology, ensuring alignment with academic standards and project goals.",
    image: require("@/assets/team/hannie.png"),
    socialLinks: [
      {
        type: "facebook",
        url: "https://www.facebook.com/share/18erkKAGeG/?mibextid=wwXIfr",
      },
    ],
  },
  {
    id: 4,
    name: "Christian Almazan",
    role: "Research & Documentation Assistant",
    bio: "Assisted in the preparation and organization of project documentation. Contributed to the thesis manuscript through research support, editing, and formatting in coordination with the lead researcher.",
    image: require("@/assets/team/christian.png"),
    socialLinks: [
      { type: "facebook", url: "https://www.facebook.com/share/1BitbvHQXs/" },
    ],
  },
];
export default teamMembers;
