import '../styles/topbar.scss';
import { useNavigate } from "react-router-dom";



export default function TopBar(){
    const navigate = useNavigate();
    return(
        <nav className="topbar">
            <div className="topbar__container">
                <div className="topbar__logo">
                    <h1>Engage</h1>
                </div>
                <div className="topbar__menu">
                    <ul className="link__items">
                        <li>
                            <a onClick={() => navigate('/upload')}>Upload</a>
                        </li>
                        <li>
                            <a onClick={() => navigate('/login')}>Login</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}