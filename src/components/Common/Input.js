// src/components/Common/Input.js

const Input = ({ type = 'text', value, onChange, placeholder }) => {
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border p-2 rounded w-full"
      />
    );
  };
  
  export default Input;
  