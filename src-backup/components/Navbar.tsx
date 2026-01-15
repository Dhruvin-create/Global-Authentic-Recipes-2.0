// @ts-nocheck
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        <Link to="/" className="text-2xl font-semibold text-gray-800 tracking-wide">
          EventSphere
        </Link>
        <div className="space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition">Home</Link>
          <Link to="/services" className="text-gray-700 hover:text-blue-600 transition">Services</Link>
          <Link to="/gallery" className="text-gray-700 hover:text-blue-600 transition">Gallery</Link>
          <Link to="/about" className="text-gray-700 hover:text-blue-600 transition">About</Link>
          <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">Contact</Link>
          <Link to="/booking" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Book Now</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
