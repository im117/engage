import "../styles/about.scss"
interface DevInfoProps {
    reverse: boolean;
    profileUrl: string;
    name: string;
    title: string;
    bio: string;
}

const DevInfo: React.FC<DevInfoProps> = ({ reverse, profileUrl, name, title, bio }) => {
    if(reverse){
        return(
            <section className="dev__section__reverse" style={{ backgroundImage: `url(${profileUrl})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }} >
            <div className="container">
            <div className="text__container">
                    <h1>{name}</h1>
                    <h2>{title}</h2>
                    <p>{bio}</p>
                </div>
                <img src={profileUrl} alt="" />
                
            </div>
        </section>
        );
    }
    return (
        <section className="dev__section" style={{ backgroundImage: `url(${profileUrl})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }} >
            <div className="container">
                <img src={profileUrl} alt="" />
                <div className="text__container">
                    <h1>{name}</h1>
                    <h2>{title}</h2>
                    <p>{bio}</p>
                </div>
            </div>
        </section>
    );
};
export default DevInfo;