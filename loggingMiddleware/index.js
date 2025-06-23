const axios = require('axios');

const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMjAzMDMxMjYwMTE0QHBhcnVsdW5pdmVyc2l0eS5hYy5pbiIsImV4cCI6MTc1MDY2Mzc0MSwiaWF0IjoxNzUwNjYyODQxLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiN2I0ZWU1NjctNDBlNi00OWYwLWJiMzItYmZiNmJkMDExZTg4IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibWFuaSBqaGFuZXN3YXIiLCJzdWIiOiI0NDMwYjI5Zi1mN2FiLTRkNzUtYTZmNi1lMWZlMDExZDMzNGMifSwiZW1haWwiOiIyMjAzMDMxMjYwMTE0QHBhcnVsdW5pdmVyc2l0eS5hYy5pbiIsIm5hbWUiOiJtYW5pIGpoYW5lc3dhciIsInJvbGxObyI6IjIyMDMwMzEyNjAxMTQiLCJhY2Nlc3NDb2RlIjoiVFJ6Z1dNIiwiY2xpZW50SUQiOiI0NDMwYjI5Zi1mN2FiLTRkNzUtYTZmNi1lMWZlMDExZDMzNGMiLCJjbGllbnRTZWNyZXQiOiJEZnZ0a3JXQ0hLVHZOZlh0In0.q-Qud26yOrkKOxh-P-iqXb4VYfk5UKqzxPXn-mYDnrQ";

const logData = {
  stack: "backend",
  level: "error",
  package: "handler",
  message: "received string, expected bool"
};

// Log headers to verify
const headers = {
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};

console.log("Request headers:", headers);

axios.post('http://20.244.56.144/evaluation-service/logs', logData, { headers })
  .then(response => {
    console.log("Log ID:", response.data.logID);
    console.log("Message:", response.data.message);
  })
  .catch(error => {
    console.error("Logging failed:", error.response?.data || error.message);
  });
