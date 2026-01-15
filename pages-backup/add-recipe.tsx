// @ts-nocheck
import Head from 'next/head';
import Layout from '../src/components/layout.tsx';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function AddRecipe() {
  const router = useRouter();
  const [form, setForm] = useState({ title:'', ingredients:'', steps:'', cooking_time:'', difficulty:'', history:'', platingStyle:'' });
  const [image, setImage] = useState(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [currentStep, setCurrentStep] = useState('basic');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImage = (e) => setImage(e.target.files[0]);
  
  const handleGenerateImage = async () => {
    if (!form.title || !form.ingredients) {
      setMessage('Please fill in recipe title and ingredients before generating an image.');
      setMessageType('error');
      return;
    }
    setGeneratingImage(true);
    try {
      const res = await fetch('/api/recipes/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          ingredients: form.ingredients,
          platingStyle: form.platingStyle,
          difficulty: form.difficulty,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setMessage('✓ Image generated successfully!');
        setMessageType('success');
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err) {
      setMessage('Error generating image: ' + err.message);
      setMessageType('error');
    }
    setGeneratingImage(false);
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => fd.append(key, val));
      
      if (generatedImageUrl) {
        const blob = await fetch(generatedImageUrl).then(r => r.blob());
        fd.append('image', blob, 'generated-recipe.jpg');
      } else if (image) {
        fd.append('image', image);
      }
      
      const res = await fetch('/api/recipes', { method: 'POST', body: fd });
      if (res.ok) {
        setMessage('✓ Recipe added successfully! Redirecting...');
        setMessageType('success');
        setForm({ title:'', ingredients:'', steps:'', cooking_time:'', difficulty:'', history:'', platingStyle:'' });
        setImage(null);
        setGeneratedImageUrl(null);
        setTimeout(() => router.push('/recipes'), 2000);
      } else {
        const errorData = await res.json();
        setMessage(`Failed to add recipe: ${errorData.error || 'Unknown error'}`);
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
      setMessageType('error');
    }
    setLoading(false);
  };

  const steps_list = ['basic', 'details', 'image', 'review'];
  const current_index = steps_list.indexOf(currentStep);

  return (
    <Layout>
      <Head>
        <title>Add Recipe - Global Authentic Recipes</title>
      </Head>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">Share Your Recipe</h1>
          <p className="text-lg text-slate-600">Contribute to our global community of home cooks</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex justify-between mb-3">
            {steps_list.map((step, idx) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  idx <= current_index
                    ? idx === current_index
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                      : 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
              layoutId="progress"
              initial={{ width: '0%' }}
              animate={{ width: `${((current_index + 1) / steps_list.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Message Alerts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: message ? 1 : 0 }}
          className="mb-6"
        >
          {message && (
            <div className={`p-4 rounded-lg border ${
              messageType === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <p className="font-semibold mb-1">{messageType === 'success' ? '✓ Success!' : '⚠ Error'}</p>
              <p className="text-sm">{message}</p>
            </div>
          )}
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: currentStep === 'basic' ? 1 : 0, x: currentStep === 'basic' ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className={currentStep !== 'basic' ? 'hidden' : ''}
          >
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>📋</span>
                Basic Information
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Recipe Title *</label>
                  <input
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    name="title"
                    placeholder="e.g., Homemade Pasta Carbonara"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Give your recipe a descriptive name</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ingredients *</label>
                  <textarea
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                    name="ingredients"
                    placeholder="2 cups all-purpose flour&#10;3 large eggs&#10;Salt to taste"
                    rows={5}
                    value={form.ingredients}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Enter one ingredient per line</p>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep('details')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: currentStep === 'details' ? 1 : 0, x: currentStep === 'details' ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className={currentStep !== 'details' ? 'hidden' : ''}
          >
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>👨‍🍳</span>
                Cooking Details
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cooking Steps *</label>
                  <textarea
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                    name="steps"
                    placeholder="1. Mix flour and eggs&#10;2. Knead the dough&#10;3. Cook until done"
                    rows={6}
                    value={form.steps}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Enter one step per line</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cooking Time (minutes) *</label>
                    <input
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      name="cooking_time"
                      type="number"
                      placeholder="30"
                      value={form.cooking_time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty Level *</label>
                    <select
                      name="difficulty"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-white"
                      value={form.difficulty}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select level</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Plating Style (optional)</label>
                  <input
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    name="platingStyle"
                    placeholder="e.g., Rustic, Modern, Family-style"
                    value={form.platingStyle}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">History/Origin *</label>
                  <textarea
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                    name="history"
                    placeholder="Tell us the fascinating story behind this recipe..."
                    rows={4}
                    value={form.history}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Share the cultural and historical context</p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep('basic')}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('image')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </motion.div>

          {/* Step 3: Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: currentStep === 'image' ? 1 : 0, x: currentStep === 'image' ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className={currentStep !== 'image' ? 'hidden' : ''}
          >
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>🖼️</span>
                Recipe Image
              </h2>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border-2 border-dashed border-amber-300">
                  <button
                    className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generatingImage || !form.title || !form.ingredients}
                  >
                    {generatingImage ? '🎨 Generating AI Image...' : '🎨 Generate Image with AI'}
                  </button>
                  <p className="text-xs text-slate-600 mt-3 text-center">Let our AI create a beautiful image based on your recipe</p>
                </div>

                {generatedImageUrl && (
                  <div className="border-2 border-green-300 bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-green-700 mb-3">✓ Generated Image Preview</p>
                    <img src={generatedImageUrl} alt="Generated recipe" className="w-full h-64 object-cover rounded-lg mb-3" />
                    <button
                      className="text-sm text-green-600 hover:text-green-700 font-semibold"
                      type="button"
                      onClick={() => setGeneratedImageUrl(null)}
                    >
                      Clear & use upload instead
                    </button>
                  </div>
                )}

                {!generatedImageUrl && (
                  <div className="border-t pt-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Or upload your own image</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer">
                      <input
                        className="hidden"
                        id="image-upload"
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImage}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <p className="text-2xl mb-2">📸</p>
                        <p className="font-semibold text-slate-700">Click to upload or drag & drop</p>
                        <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
                      </label>
                    </div>
                    {image && <p className="text-sm text-green-600 font-semibold mt-2">✓ {image.name} selected</p>}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep('details')}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('review')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </motion.div>

          {/* Step 4: Review */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: currentStep === 'review' ? 1 : 0, x: currentStep === 'review' ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className={currentStep !== 'review' ? 'hidden' : ''}
          >
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>✓</span>
                Review Your Recipe
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {generatedImageUrl || image ? (
                  <img
                    src={generatedImageUrl || URL.createObjectURL(image)}
                    alt="Recipe preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                    <p className="text-slate-500">No image</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Title</p>
                    <p className="text-xl font-bold text-slate-900">{form.title}</p>
                  </div>
                  <div className="flex gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Time</p>
                      <p className="text-lg font-bold text-slate-900">{form.cooking_time} min</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Difficulty</p>
                      <p className="text-lg font-bold text-slate-900">{form.difficulty}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg mb-8 max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Preview</p>
                <p className="text-slate-700 text-sm leading-relaxed">{form.history}</p>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep('image')}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Adding Recipe...' : '✓ Publish Recipe'}
                </button>
              </div>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </Layout>
  );
}
