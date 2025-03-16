import '../styles/topbar.scss';



export default function TopBar(){
    return(
        <nav className="topbar">
            <div className="topbar__container">
                <div className="topbar__logo">
                    <h1>N</h1>
                </div>
                <div className="topbar__menu">
                    <ul className="link__items">
                        <li>
                            <a href="/upload">Upload</a>
                        </li>
                        <li>
                            <a href="/login">Login</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}