export default function ScamCard(props) {
  const wide = props.wide ? "wide" : "";
  const content = (
    <>
      <div className="s-thumb">
        <span className={`sev ${props.sevClass}`}>{props.badge}</span>
        <img src={props.image} alt={props.name} />
      </div>
      <div className="s-content">
        <div className="s-top-row">
          <span className="s-dest">{props.destination}</span>
          <span className="s-loss">{props.loss}</span>
        </div>
        <div className="s-name">{props.name}</div>
        <p className="s-desc">{props.description}</p>
        <div className="s-avoid"><i className="fa-solid fa-shield-halved"></i>{props.avoidanceTip}</div>
        <div className="s-src">{props.sourceInfo}</div>
      </div>
    </>
  );

  return (
    <div className={`s-card ${wide} reveal`} style={{ '--i': props.index ?? 0 }}>
      {props.wide ? <div className="s-body-row">{content}</div> : content}
    </div>
  );
}