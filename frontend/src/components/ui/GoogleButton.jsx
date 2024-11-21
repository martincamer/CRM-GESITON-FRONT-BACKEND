const GoogleButton = ({ onClick, text }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3 px-4 border border-gray-300 rounded-full 
                flex items-center justify-center gap-2 
                hover:bg-gray-50 transition-colors
                text-gray-700 font-medium"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-5 h-5"
      />
      <span>{text}</span>
    </button>
  );
};

export default GoogleButton;
