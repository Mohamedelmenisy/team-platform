import React from 'react';
import { useHistory } from 'react-router-dom';

const Dashboard = () => {
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem("user"); // حذف بيانات الجلسة
    history.push("/login"); // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
  };

  return (
    <div>
      <h2>Welcome to the Dashboard!</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
