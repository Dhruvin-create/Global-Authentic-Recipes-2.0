// @ts-nocheck
import Navbar from "../Navbar";

const Home = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center bg-gradient-to-r from-blue-100 to-blue-50 h-[90vh] pt-20">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Make Every Event Unforgettable 🎉
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
          From weddings and concerts to conferences — we handle it all with precision, creativity, and elegance.
        </p>
        <a
          href="/booking"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
        >
          Get Started
        </a>
      </section>

      {/* Services Preview */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-10">
          Our Core Services
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Weddings", img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e" },
            { title: "Concerts", img: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2" },
            { title: "Corporate Events", img: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51" },
          ].map((service, idx) => (
            <div key={idx} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition">
              <img src={service.img} alt={service.title} className="w-full h-48 object-cover" />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800">{service.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <h2 className="text-3xl font-semibold mb-4">Let’s Plan Your Next Event!</h2>
        <p className="text-lg mb-6">Book your perfect experience with our expert team today.</p>
        <a
          href="/booking"
          className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Book Now
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} EventSphere. All rights reserved.</p>
          <div className="space-x-6">
            <a href="/privacy" className="hover:text-white">Privacy Policy</a>
            <a href="/terms" className="hover:text-white">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
