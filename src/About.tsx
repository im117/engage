import "./styles/about.scss"

function About(){
    
    return(
    <div className="about__container">
        <section className="main__section">
            <img src="/src/assets/icon.svg"></img>
            <h1>Engage</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rhoncus nulla vitae nisl sagittis, ac ornare arcu ultricies. Curabitur aliquam lacus ut enim tristique, at lobortis mi condimentum. Pellentesque viverra tincidunt arcu, vel faucibus leo sagittis vitae. Mauris commodo dictum sapien in ullamcorper. Etiam fringilla ultricies euismod. Nulla vitae rhoncus nibh.</p>
        </section>
        <section className="dev__section josh">
            <div className="container">
            <img src="/src/assets/josh.jpg"></img>
            <div className="text__container">
                <h1>Joshua Randall</h1>
                <h2>Title</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rhoncus nulla vitae nisl sagittis, ac ornare arcu ultricies. Curabitur aliquam lacus ut enim tristique, at lobortis mi condimentum. Pellentesque viverra tincidunt arcu, vel faucibus leo sagittis vitae. Mauris commodo dictum sapien in ullamcorper. Etiam fringilla ultricies euismod. Nulla vitae rhoncus nibh.</p>
            </div>
            </div>
            
        </section>
    </div>)
}
export default About;