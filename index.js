const stateCenter = {};

let index = 0;

const listenerCenter = {
  click: [],
};

function useState(initialValue) {
  const componentName = useState.caller.name;
  const _index = index;

  if (!stateCenter[componentName]) {
    stateCenter[componentName] = [];
  }

  if (stateCenter[componentName][index] === undefined) {
    stateCenter[componentName][index] = {
      state: initialValue,
    };
  }

  index++;
  return (function () {
    return [
      stateCenter[componentName][_index].state,
      (newValue) => {
        stateCenter[componentName][_index].state = newValue;
      },
    ];
  })();
}

function createElement(type, props = {}, children) {
  return {
    type,
    props,
    children,
  };
}

function QReactElement({ type, props, children, parentNode = null }) {
  this.type = type;
  this.props = props;
  this.children = children;
  this.parentNode = parentNode;

  if (props.onClick) {
    listen.call(this, "click", props.onClick);
  }

  let el;
  if (type === "text") {
    el = document.createTextNode(children);
    el.reactInstance = this;
    return el;
  }

  el = document.createElement(type);
  el.reactInstance = this;
  el.append(
    ...children.map(
      (child) =>
        new QReactElement({
          ...child,
          parentNode: this,
        })
    )
  );

  return el;
}

function render(factory, parent = null) {
  if (!parent) {
    throw "no container";
  }

  parent.appendChild(new QReactElement(factory()));
  const cb = (e) => {
    const targetHandlers = listenerCenter["click"];
    const { handler } = targetHandlers.find(
      (th) => th.target === e.target.reactInstance
    );
    handler();

    // rerender
    parent.innerHTML = "";
    index = 0;
    parent.removeEventListener("click", cb);
    render(factory, parent);
  };
  parent.addEventListener("click", cb);
}

function listen(eventType, handler) {
  listenerCenter[eventType].push({
    target: this,
    handler,
  });
}

const QndReact = {
  createElement,
  render,
};

function App() {
  this.name = "App";

  const [count, setCount] = useState(0);
  const [test, setTest] = useState(1);

  return QndReact.createElement("div", {}, [
    QndReact.createElement("h1", { className: "primary" }, [
      QndReact.createElement(
        "text",
        {},
        `QndReact is Quick and dirty react, test: ${test}`
      ),
    ]),

    QndReact.createElement(
      "p",
      {
        onClick: () => {
          setCount(count + 1);
          setTest(test + 1);
        },
      },
      [QndReact.createElement("text", {}, count)]
    ),
  ]);
}

function createFactory(Function) {
  return () => {
    const component = new Function();

    return component;
  };
}

QndReact.render(createFactory(App), document.getElementById("app"));
