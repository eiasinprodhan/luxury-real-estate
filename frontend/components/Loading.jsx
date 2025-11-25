export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex space-x-2 justify-center mb-6">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
        <p className="text-gray-900 text-2xl font-light">Loading...</p>
      </div>
    </div>
  );
}
