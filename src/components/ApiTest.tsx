'use client';

import { useState } from 'react';

export default function ApiTest() {
  const [result, setResult] = useState('');

  const testApi = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}`
      );
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <button onClick={testApi} className="bg-blue-500 text-white px-4 py-2 rounded">
        Test API Key
      </button>
      <pre className="mt-4 bg-white p-4 rounded">{result}</pre>
    </div>
  );
}