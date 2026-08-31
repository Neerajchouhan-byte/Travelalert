export default function AlertCard(props) {
  return (
    <article className="scam-card">
      <div className={"sev-bar " + props.sevClass}></div>
      <div className="scam-top">
        <div className="scam-meta">
          <div className="scam-dest">{props.destination}</div>
          <div className={"scam-badge " + props.badgeClass}>{props.badge}</div>
        </div>
        <div className={"scam-loss " + props.lossClass}>{props.loss}</div>
        <div className="scam-loss-lbl">{props.lossLabel}</div>
        <div className="scam-name">{props.name}</div>
      </div>
      <div className="scam-body">
        <p className="scam-desc">{props.description}</p>
        <div className="scam-avoid">{props.avoidanceTip}</div>
        <div className="scam-src">
          <span className="src-dot"></span>
          {props.sourceInfo}
        </div>
      </div>
    </article>
  );
}