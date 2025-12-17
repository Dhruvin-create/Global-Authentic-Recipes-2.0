// @ts-nocheck
import Layout from "../layout.tsx";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AddRecipe() {
  const [form, setForm] = useState({ title:'', ingredients:'', steps:'', cooking_time:'', difficulty:'', history:'' });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImage = (e) => setImage(e.target.files[0]);
  const handleSubmit = async(e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => fd.append(key, val));
    if (image) fd.append('image', image);
    const res = await fetch('/api/recipes', { method: 'POST', body: fd });
    if (res.ok) {
      setMessage('Recipe added!');
      setForm({ title:'', ingredients:'', steps:'', cooking_time:'', difficulty:'', history:'' });
      setImage(null);
    } else setMessage('Error!');
  };

  return (
    <Layout>
      <motion.form initial={{ scale: 0.95 }} animate={{ scale: 1 }} onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-bold">Add a New Recipe</h2>
        <input className="border rounded p-2 w-full" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <textarea className="border rounded p-2 w-full" name="ingredients" placeholder="Ingredients" rows={2} value={form.ingredients} onChange={handleChange} required />
        <textarea className="border rounded p-2 w-full" name="steps" placeholder="Steps" rows={2} value={form.steps} onChange={handleChange} required />
        <input className="border rounded p-2 w-full" name="cooking_time" placeholder="Cooking Time (min)" type="number" value={form.cooking_time} onChange={handleChange} required />
        <select name="difficulty" className="border rounded p-2 w-full" value={form.difficulty} onChange={handleChange} required>
          <option value="">Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <textarea className="border rounded p-2 w-full" name="history" placeholder="Recipe History/Origin" rows={2} value={form.history} onChange={handleChange} required />
        <input className="border rounded p-2 w-full" type="file" name="image" accept="image/*" onChange={handleImage} required />
        <button className="bg-green-700 text-white px-4 py-2 rounded" type="submit">Add Recipe</button>
        {message && <div>{message}</div>}
      </motion.form>
    </Layout>
  );
}
