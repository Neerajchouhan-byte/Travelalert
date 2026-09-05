import Image from "next/image";

export default function ScamCard(props) {
  const wide = props.wide ? "wide" : "";
  const content = (
    <>
      <div className="s-thumb">
        <span className={`sev ${props.sevClass}`}>{props.badge}</span>
        {props.image ? (
          <Image
            src={props.image}
            alt=""
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
          />
        ) : (
          <div style={{ height: "100%", background: "var(--surface-inner)" }} />
        )}
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