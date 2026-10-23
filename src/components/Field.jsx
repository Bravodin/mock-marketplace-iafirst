/** Campo de formulário com label, id e mensagem de erro padronizados para automação. */
export default function Field({ id, label, error, children, hint, className = '' }) {
  return (
    <div className={`field ${error ? 'field-error' : ''} ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <small className="hint">{hint}</small>}
      {error && (
        <small className="error-text" data-testid={`${id}-error`} role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

export function Spinner({ testId = 'loading', texto = 'Carregando...' }) {
  return (
    <div className="spinner-wrap" data-testid={testId} role="status">
      <span className="spinner" /> {texto}
    </div>
  );
}
