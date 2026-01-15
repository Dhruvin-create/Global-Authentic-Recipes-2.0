// @ts-nocheck
import Layout from "../../layout.tsx";
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { motion } from "framer-motion";

const fetcher = url => fetch(url).then(res => res.json());

export default function RecipeDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error } = useSWR(id ? `/api/recipes/${id}` : null, fetcher);

  if (!data) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error loading recipe.</div></Layout>;

  return (
    <Layout>
      <motion.div initial={{ y: 40 }} animate={{ y: 0 }}>
        <img src={data.image} className="w-full h-64 object-cover rounded-lg mb-3" alt={data.title} />
        <h2 className="text-3xl font-bold mb-1">{data.title}</h2>
        <span className="text-sm mb-4 block">Cooking Time: {data.cooking_time} min | Difficulty: {data.difficulty}</span>
        <h3 className="text-xl font-semibold">Ingredients</h3>
        <p className="mb-2 whitespace-pre-line">{data.ingredients}</p>
        <h3 className="text-xl font-semibold">Steps</h3>
        <p className="mb-2 whitespace-pre-line">{data.steps}</p>
        <h3 className="text-xl font-semibold">History/Origin</h3>
        <p className="opacity-80">{data.history}</p>
        <button onClick={async () => {
          if (confirm("Delete recipe?")) {
            await fetch(`/api/recipes/${id}`, { method: "DELETE" });
            router.push("/recipes");
          }
        }} className="mt-4 bg-red-600 text-white px-2 py-1 rounded">Delete</button>
      </motion.div>
    </Layout>
  );
}
// @ts-nocheck
import Layout from "../../layout.tsx";
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { motion } from "framer-motion";

const fetcher = url => fetch(url).then(res => res.json());

export default function RecipeDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error } = useSWR(id ? `/api/recipes/${id}` : null, fetcher);

  if (!data) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error loading recipe.</div></Layout>;

  return (
    <Layout>
      <motion.div initial={{ y: 40 }} animate={{ y: 0 }}>
        <img src={data.image} className="w-full h-64 object-cover rounded-lg mb-3" alt={data.title} />
        <h2 className="text-3xl font-bold mb-1">{data.title}</h2>
        <span className="text-sm mb-4 block">Cooking Time: {data.cooking_time} min | Difficulty: {data.difficulty}</span>
        <h3 className="text-xl font-semibold">Ingredients</h3>
        <p className="mb-2 whitespace-pre-line">{data.ingredients}</p>
        <h3 className="text-xl font-semibold">Steps</h3>
        <p className="mb-2 whitespace-pre-line">{data.steps}</p>
        <h3 className="text-xl font-semibold">History/Origin</h3>
        <p className="opacity-80">{data.history}</p>
        <button onClick={async () => {
          if (confirm("Delete recipe?")) {
            await fetch(`/api/recipes/${id}`, { method: "DELETE" });
            router.push("/recipes");
          }
        }} className="mt-4 bg-red-600 text-white px-2 py-1 rounded">Delete</button>
      </motion.div>
    </Layout>
  );
}
