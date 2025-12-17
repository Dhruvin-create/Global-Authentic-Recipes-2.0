// @ts-nocheck
import Layout from "../layout.tsx";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <Layout>
      <motion.section initial={{ x: -50 }} animate={{ x: 0 }}>
        <h2 className="text-3xl font-semibold mb-2">Discover Authentic Recipes From Around the World</h2>
        <p className="mb-5">Welcome to a global kitchen where every dish tells a story. Explore, cook, and share!</p>
        <a href="/recipes" className="bg-blue-600 text-white px-4 py-2 rounded">View Recipes</a>
      </motion.section>
    </Layout>
  );
}
