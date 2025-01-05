// src/components/Button.js
import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ text, link }) => {
    return (
        <Link
            to={link}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
            {text}
        </Link>
    );
};

export default Button;