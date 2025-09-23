import { COLORS } from "./constants/colors";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Download from "./components/Download";
import About from "./components/About";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";
import Explore from "./components/Explore";

function App() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: COLORS.background.primary,
        color: COLORS.text.primary,
      }}
    >
      <Navigation />
      <Hero />
      <Features />
      <Explore />
      <About />
      <Download />
      <Footer />
    </div>
  );
}

export default App;
