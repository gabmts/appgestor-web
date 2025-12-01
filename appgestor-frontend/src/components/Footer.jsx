export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <p>
        &copy; {currentYear} <strong>AppGestor - A Casa da Luna</strong>. Todos os direitos reservados.
      </p>
      <p style={{ marginTop: '5px' }}>
        Desenvolvido com 🍷 por <a href="#" target="_blank" rel="noopener noreferrer">Gabriel Matos</a>
      </p>
    </footer>
  );
}