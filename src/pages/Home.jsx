import Card from "../components/Card";



export default function HomePage() {


    return (
        <div className="flex flex-wrap md:flex-nowrap gap-6 p-4 justify-center">
            <Card>
                <h1>About</h1>
                <br />
                <p>
                    Plural Underground, is an app designed and created by mags, a plural system themself. Mags is a trained and experienced web and app dev, and is committed to making this app functional, and longlasting.
                    <br />
                    <br />
                    This is a sys-course free app, and mags is against the use of AI in apps.
                    <br />
                    <br />
                    Currently in beta on web for a select group, the app will be on iOS and Google Play stores in the coming month!
                </p>
            </Card>
            <Card>
                <h1>Features</h1>
                <br />
                <p>
                    ✦ Managing members (import/create/edit) <br/>
                    ✦ Multiple system capacity<br/>
                    ✦ Tracking front changes<br/>
                    ✦ Journaling (system wide and per member)<br/>
                    ✦ Sharing systems, members, and fronts with friends<br/>
                    ✦ Symptom tracking<br/>
                    ✦ Front and symptom analytics<br/>
                    ✦ Reminders<br/>
                    ✦ Polls/Questions<br/>
                    ✦ Custom Fields<br/>
                    ✦ Custom Fronts (ability to save as well for future use)<br/>
                    ✦ Front Status<br/>
                    ✦ Relationship Tracking<br/>
                </p>
            </Card>
            <Card>
                <h1>Contact</h1>
                <br/>
                <h2 className="text-2xl">Discord</h2>
                <p>Get updates, talk to the developer, and send in suggestions here.</p>
                <br/>
                <h2 className="text-2xl">Tumblr</h2>
                <p>View our blog and ask questions here.</p>
            </Card>
        </div>
    )
};