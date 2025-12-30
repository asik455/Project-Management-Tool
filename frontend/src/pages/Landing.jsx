import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
          alt="Professional Office Background"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-blue-900/95"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-16 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-white text-6xl sm:text-7xl font-bold tracking-tight mb-4">
            ProjectHub
          </h1>
          <p className="text-blue-200 text-xl font-medium">Enterprise Project Management Solution</p>
        </div>
        
        <p className="text-gray-300 text-lg sm:text-xl mb-12 max-w-2xl leading-relaxed">
          Transform your project management experience with our powerful platform.
          Streamline workflows, enhance team collaboration, and deliver results efficiently.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-md">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
          >
            Get Started
          </Link>
          <Link
            to="/signin"
            className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded hover:bg-white/10 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <h3 className="text-white text-lg font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-400">Work together seamlessly with real-time updates</p>
          </div>
          <div className="p-4">
            <h3 className="text-white text-lg font-semibold mb-2">Task Management</h3>
            <p className="text-gray-400">Organize and track tasks with intuitive workflows</p>
          </div>
          <div className="p-4">
            <h3 className="text-white text-lg font-semibold mb-2">Analytics & Insights</h3>
            <p className="text-gray-400">Make data-driven decisions with project analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 