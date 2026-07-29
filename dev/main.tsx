import { render } from "solid-js/web";
import { DefaultMeteorShower } from "../src/meteor-shower";
import "../src/meteor-shower/meteor-shower.css";
import "../src/meteor-shower/meteor.css";
import "./style.css";

function App() {
  return (
    <section class="demo-surface">
      <DefaultMeteorShower />
      <p>Meteor shower</p>
    </section>
  );
}

render(() => <App />, document.getElementById("root")!);
