import { COLORS } from "./constants/colors";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Download from "./components/Download";
import About from "./components/About";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";

function App() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: COLORS.background.primary,
        color: COLORS.text.primary,
      }}
    >
      <Navigation />
      <Hero />
      <Features />
      <About />
      <Download />
      <Footer />
    </div>
  );
}

export default App;
