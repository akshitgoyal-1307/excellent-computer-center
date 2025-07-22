import React, { useState, useEffect, createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// --- Firebase Configuration ---
// This is your live Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyCCJ0VCaRNND74d7_KK0W6C2Qu6W-AIaaI",
  authDomain: "excellent-computer-cente-17a37.firebaseapp.com",
  projectId: "excellent-computer-cente-17a37",
  storageBucket: "excellent-computer-cente-17a37.appspot.com",
  messagingSenderId: "384921075859",
  appId: "1:384921075859:web:4a6187aa1bf09dfa9bcd66",
  measurementId: "G-W7H45Y97HN",
};

// --- Initialize Firebase ---
let app;
let auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.error("Firebase initialization error:", e);
}

// --- Authentication Context ---
// This will help us manage the user's login state throughout the app.
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// --- Main App Component ---
export default function App() {
  return (
    <AuthProvider>
      <PageRouter />
    </AuthProvider>
  );
}

// --- Simple Router ---
// This component will decide which page to show based on the URL hash.
function PageRouter() {
  const [page, setPage] = useState("home");
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setPage(hash);
      } else {
        setPage("home");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Initial check
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  let CurrentPage;
  switch (page) {
    case "courses":
      CurrentPage = CoursesSection;
      break;
    case "about":
      CurrentPage = AboutSection;
      break;
    case "contact":
      CurrentPage = ContactSection;
      break;
    case "login":
      CurrentPage = LoginPage;
      break;
    case "signup":
      CurrentPage = SignupPage;
      break;
    case "dashboard":
      CurrentPage = currentUser ? DashboardPage : LoginPage;
      break;
    default:
      CurrentPage = HomePage;
  }

  return (
    <div className="bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main>
        <CurrentPage />
      </main>
      <Footer />
    </div>
  );
}

// --- Pages & Components ---

const Header = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.hash = "#home"; // Redirect to home after logout
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-xl shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#home" className="flex items-center space-x-3">
          <span className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30">
            <i className="fas fa-laptop-code text-2xl text-white"></i>
          </span>
          <span className="text-xl font-bold text-gray-900">
            Excellent Computer Center
          </span>
        </a>
        <div className="hidden md:flex items-center space-x-6 font-medium">
          <a href="#home" className="text-gray-600 hover:text-blue-600">
            Home
          </a>
          <a href="#courses" className="text-gray-600 hover:text-blue-600">
            Courses
          </a>
          <a href="#about" className="text-gray-600 hover:text-blue-600">
            About
          </a>
          <a href="#contact" className="text-gray-600 hover:text-blue-600">
            Contact
          </a>
          {currentUser ? (
            <>
              <a
                href="#dashboard"
                className="text-gray-600 hover:text-blue-600"
              >
                My Courses
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="#login" className="text-gray-600 hover:text-blue-600">
                Login
              </a>
              <a
                href="#signup"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700"
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

const HomePage = () => (
  <>
    <section className="hero-gradient text-white">
      <div className="container mx-auto px-6 py-24 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
          Shape Your Future with Technology
        </h1>
        <p className="text-lg md:text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
          Join our online courses and gain the skills to succeed in the digital
          world, from anywhere.
        </p>
        <a
          href="#courses"
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition transform hover:scale-105 inline-block"
        >
          Explore Courses
        </a>
      </div>
    </section>
    <AboutSection />
    <CoursesSection />
    <ContactSection />
  </>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.hash = "#dashboard";
    } catch (err) {
      setError("Failed to log in. Please check your email and password.");
      console.error(err);
    }
  };

  return (
    <div className="py-20 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">
          Login to Your Account
        </h2>
        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
            {error}
          </p>
        )}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-full font-bold hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <p className="text-center">
          Don't have an account?{" "}
          <a href="#signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.hash = "#dashboard";
    } catch (err) {
      setError(
        "Failed to create an account. The email might already be in use."
      );
      console.error(err);
    }
  };

  return (
    <div className="py-20 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">Create Your Account</h2>
        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
            {error}
          </p>
        )}
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-full font-bold hover:bg-blue-700"
          >
            Create Account
          </button>
        </form>
        <p className="text-center">
          Already have an account?{" "}
          <a href="#login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { currentUser } = useAuth();
  return (
    <div className="py-20 container mx-auto px-6">
      <h1 className="text-4xl font-bold mb-2">My Courses</h1>
      <p className="text-gray-600 mb-8">Welcome back, {currentUser?.email}!</p>
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-2xl font-bold text-gray-700">
          Your course library is empty.
        </h3>
        <p className="text-gray-500 mt-2">
          Explore our courses to start learning!
        </p>
        <a
          href="#courses"
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 inline-block"
        >
          Browse Courses
        </a>
      </div>
    </div>
  );
};

// --- Reusable Sections from previous design ---
const AboutSection = () => (
  <section id="about" className="py-20 md:py-28 bg-white">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="reveal">
          <img
            src="https://placehold.co/600x400/e2e8f0/334155?text=Our+Center"
            alt="Excellent Computer Center building"
            className="rounded-xl shadow-lg"
          />
        </div>
        <div className="reveal">
          <h2 className="section-title text-gray-900 mb-4">
            Welcome to Excellent Computer Center
          </h2>
          <p className="text-gray-600 mb-6">
            We are Thana Bhawan's leading computer training institute, dedicated
            to providing high-quality, practical education. Our mission is to
            empower our students with the skills and confidence needed to excel
            in today's competitive job market.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const CoursesSection = () => {
  const courses = [
    {
      name: "Basic Course",
      duration: "2 Months",
      content:
        "Paint, Notepad, MS Word, MS Excel, MS PowerPoint, Computer Fundamentals.",
      icon: "fas fa-keyboard",
    },
    {
      name: "MS Office",
      duration: "2 Months",
      content: "MS Word, MS Excel, MS PowerPoint, MS Access, Mail Functions.",
      icon: "fab fa-microsoft",
    },
    {
      name: "Tally Prime",
      duration: "3 Months",
      content:
        "Tally Prime with GST, Accounting Principles, Inventory Management.",
      icon: "fas fa-file-invoice-dollar",
    },
    {
      name: "Advanced Excel",
      duration: "2 Months",
      content: "Advanced formulas, PivotTables, VLOOKUP, HLOOKUP, Macros.",
      icon: "fas fa-file-excel",
    },
    {
      name: "DCA",
      duration: "6 Months",
      content: "Fundamentals, MS Office, Tally Prime, Internet, Multimedia.",
      icon: "fas fa-graduation-cap",
    },
    {
      name: "ADCA",
      duration: "12 Months",
      content: "DCA syllabus plus SQL, and Database Concepts.",
      icon: "fas fa-user-graduate",
    },
    {
      name: "SQL",
      duration: "3 Months",
      content: "Database design, CRUD operations, Joins, and Subqueries.",
      icon: "fas fa-database",
    },
    {
      name: "Power BI",
      duration: "3 Months",
      content: "Data Visualization, Interactive Dashboards, DAX formulas.",
      icon: "fas fa-chart-pie",
    },
  ];

  return (
    <section id="courses" className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-title text-gray-900 mb-4">
            Our Professional Courses
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Find the perfect course to match your career goals.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course) => (
            <div
              key={course.name}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-blue-500/20 flex flex-col transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <i className={`${course.icon} text-3xl`}></i>
              </div>
              <h3 className="text-xl font-bold mb-2">{course.name}</h3>
              <p className="font-semibold text-blue-600 mb-4">
                {course.duration}
              </p>
              <p className="text-gray-500 text-sm flex-grow">
                {course.content}
              </p>
              <a
                href="#signup"
                className="mt-6 bg-blue-100 text-blue-700 text-center px-6 py-2 rounded-full font-bold hover:bg-blue-200"
              >
                Enroll Now
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => (
  <section id="contact" className="py-20 md:py-28 bg-white">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="section-title text-gray-900 mb-4">Get In Touch</h2>
      </div>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
          <div className="space-y-4 text-gray-700">
            <p className="flex items-start">
              <i className="fas fa-map-marker-alt mt-1 mr-4 text-blue-600"></i>
              <span>
                Bobi Inverter Wale, Mohalla- Shahalal, Near D.N. Public School,
                Thana Bhawan, Shamli, Uttar Pradesh
              </span>
            </p>
            <p className="flex items-center">
              <i className="fas fa-phone-alt mr-4 text-blue-600"></i>
              <span>+91 89236 70156, +91 93198 45134</span>
            </p>
            <p className="flex items-center">
              <i className="fas fa-envelope mr-4 text-blue-600"></i>
              <span>info.excellent.computer.center@gmail.com</span>
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
          <form action="https://formspree.io/f/xzzvdklp" method="POST">
            <div className="mb-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                name="message"
                placeholder="Message"
                rows="4"
                className="w-full px-4 py-2 border rounded-lg"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-full font-bold"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-900 text-white">
    <div className="container mx-auto px-6 py-8 text-center">
      <p className="text-gray-400">
        &copy; 2025 Excellent Computer Center. All Rights Reserved.
      </p>
    </div>
  </footer>
);

// --- CSS for Hero Gradient ---
const style = document.createElement("style");
style.innerHTML = `
    .hero-gradient {
        background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
    }
    .section-title {
        font-weight: 800;
        font-size: 2.5rem;
        letter-spacing: -0.025em;
    }
    .section-subtitle {
        font-size: 1.125rem;
        color: #4b5563;
    }
`;
document.head.appendChild(style);
