import '../Styles/AnimatedBackground.css'
export default function AnimatedBackground() {
  return (
    <div className="af-background">
      <div className="af-stars">{Array.from({length:12},(_,i)=><div key={i} className={`af-star af-star-${i+1}`}/>)}</div>
      <div className="af-shooting-star af-ss1"/><div className="af-shooting-star af-ss2"/><div className="af-shooting-star af-ss3"/>
      <div className="af-clouds">{Array.from({length:5},(_,i)=><div key={i} className={`af-cloud af-cloud-${i+1}`}/>)}</div>
      <div className="af-moon"/>
    </div>
  )
}
