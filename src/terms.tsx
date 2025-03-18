import { useNavigate } from 'react-router-dom';
import './styles/auth.scss';


function Terms(){
    const navigate = useNavigate();
    return(
        <main>
            <div className="center-container">
            <h3 style={{ color: 'white' }}>No illegal content, otherwise go nuts</h3>
            <button className="button primary" onClick={() => navigate('/signup')}>Back to Signup</button>
        </div>
        </main>
        
    )
}

export default Terms;