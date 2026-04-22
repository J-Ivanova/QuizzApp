import './App.css';
import Navbar from './components/Navbar.jsx';
import QuestionsBox from './components/QuestionsBox.jsx';
import UsageTracker from './components/UsageTracker.jsx';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <QuestionsBox/>
      <UsageTracker />
    </div>
  );
}

export default App;
