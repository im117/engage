import { useNavigate } from 'react-router-dom';
import './styles/signup.scss';


function Terms(){
    const navigate = useNavigate();
    return(
        <div>
            <h3 style={{ color: 'white' }}>No illegal content, otherwise go nuts</h3>
            <button className="signup__button" onClick={() => navigate('/signup')}>Back to Signup</button>
        </div>
    )
}

export default Terms;