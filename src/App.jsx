import { useState } from 'react';
import { SeminarManager } from './components/SeminarManager.jsx';
import { AttendanceManager } from './components/AttendanceManager.jsx';

function App() {
  const [seminars, setSeminars] = useState([]);

  return (
    <div className="app-container">
      <h1>IT 세미나 정보 관리</h1>
      <SeminarManager onSeminarsChange={setSeminars} />
      <AttendanceManager seminars={seminars} />
    </div>
  );
}

export default App;
