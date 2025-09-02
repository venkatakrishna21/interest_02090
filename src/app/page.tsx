export default function Home() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>
      <div style={{textAlign:'center'}}>
        <h1>Interest App</h1>
        <p><a href="/owner/login">Owner Login</a> | <a href="/customer/login">Customer Login</a></p>
      </div>
    </div>
  );
}
