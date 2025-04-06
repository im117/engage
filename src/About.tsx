import "./styles/about.scss"
import "./components/DevInfo"
import DevInfo from "./components/DevInfo";

function About(){
    
    return(
    <div className="about__container">
        <section className="main__section">
            <img src="/src/assets/icon.svg"></img>
            <h1>Engage</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rhoncus nulla vitae nisl sagittis, ac ornare arcu ultricies. Curabitur aliquam lacus ut enim tristique, at lobortis mi condimentum. Pellentesque viverra tincidunt arcu, vel faucibus leo sagittis vitae. Mauris commodo dictum sapien in ullamcorper. Etiam fringilla ultricies euismod. Nulla vitae rhoncus nibh.</p>
        </section>
        <DevInfo
            reverse={false}
            name="Joshua Randall" 
            title="Team Lead, Head of Frontend" 
            profileUrl="/src/assets/josh.jpg" 
            bio="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rhoncus nulla vitae nisl sagittis, ac ornare arcu ultricies. Curabitur aliquam lacus ut enim tristique, at lobortis mi condimentum. Pellentesque viverra tincidunt arcu, vel faucibus leo sagittis vitae. Mauris commodo dictum sapien in ullamcorper. Etiam fringilla ultricies euismod. Nulla vitae rhoncus nibh."
        />
        <DevInfo
            reverse={true}
            name="Johnny Zheng" 
            title="Co-Lead, Chief Officer, Head of Databases" 
            profileUrl="/src/assets/johnny.jpg" 
            bio="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rhoncus nulla vitae nisl sagittis, ac ornare arcu ultricies. Curabitur aliquam lacus ut enim tristique, at lobortis mi condimentum. Pellentesque viverra tincidunt arcu, vel faucibus leo sagittis vitae. Mauris commodo dictum sapien in ullamcorper. Etiam fringilla ultricies euismod. Nulla vitae rhoncus nibh."
        />
        <DevInfo
            reverse={false}
            name="Long (Jackson) Le" 
            title="Officer, Head of Backend" 
            profileUrl="/src/assets/long.JPG" 
            bio="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rhoncus nulla vitae nisl sagittis, ac ornare arcu ultricies. Curabitur aliquam lacus ut enim tristique, at lobortis mi condimentum. Pellentesque viverra tincidunt arcu, vel faucibus leo sagittis vitae. Mauris commodo dictum sapien in ullamcorper. Etiam fringilla ultricies euismod. Nulla vitae rhoncus nibh."
        />
        <DevInfo
            reverse={true}
            name="Maksim Spitsyn" 
            title="" 
            profileUrl="" 
            bio="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rhoncus nulla vitae nisl sagittis, ac ornare arcu ultricies. Curabitur aliquam lacus ut enim tristique, at lobortis mi condimentum. Pellentesque viverra tincidunt arcu, vel faucibus leo sagittis vitae. Mauris commodo dictum sapien in ullamcorper. Etiam fringilla ultricies euismod. Nulla vitae rhoncus nibh."
        />
        <DevInfo
            reverse={false}
            name="Riyat Leiyate" 
            title="" 
            profileUrl="/src/assets/riyat.jpg" 
            bio="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rhoncus nulla vitae nisl sagittis, ac ornare arcu ultricies. Curabitur aliquam lacus ut enim tristique, at lobortis mi condimentum. Pellentesque viverra tincidunt arcu, vel faucibus leo sagittis vitae. Mauris commodo dictum sapien in ullamcorper. Etiam fringilla ultricies euismod. Nulla vitae rhoncus nibh."
        />
    </div>)
}
export default About;