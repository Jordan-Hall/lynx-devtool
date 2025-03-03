const { useState } = React;

const Greet = (props) => {
  const [json, setJson] = useState();
  const onChange = (event) => {
    console.log(event.target.value);
    setJson(event.target.value);
  };
  props.addSelectedNodeChangedListener(console.log);
  const onClick = (event) => {
    props.registerPlugin(JSON.parse(json ?? ""), true);
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("textarea", {
    name: "Text1",
    cols: 40,
    rows: 20,
    onChange
  }), /* @__PURE__ */ React.createElement("button", {
    onClick
  }, "submit"));
};
export default Greet;
