// @ts-nocheck
import Layout from "../layout.tsx";
import { motion } from "framer-motion";
import useSWR from 'swr';

const fetcher = url => fetch(url).then(res => res.json());

export default function Recipes() {
  const { data = [], error } = useSWR('/api/recipes', fetcher);

  return (
    <Layout>
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-bold mb-4">All Recipes</h2>
        {error && <div>Error loading recipes.</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((r) => (
            <a key={r.id} href={`/recipes/${r.id}`} className="block rounded-lg shadow hover:scale-105 transition-transform">
              <img src={r.image} className="w-full h-48 object-cover rounded-t-lg" alt={r.title} />
              <div className="p-4">
                <h3 className="font-semibold">{r.title}</h3>
                <span className="text-sm opacity-60">Cook: {r.cooking_time} min | {r.difficulty}</span>
              </div>
            </a>
          ))}
        </div>
      </motion.section>
    </Layout>
  );
}
