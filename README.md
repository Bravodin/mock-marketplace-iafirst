# Loja Mock — app React para automação com Selenium

Loja virtual 100% mockada (sem backend): login, catálogo, detalhe do produto, carrinho com cupom, checkout, confirmação de pedido, "Meus pedidos" e cadastro/edição de cliente. Responsiva, para testar também em modo mobile (DevTools → device emulation ou `ChromeOptions.EnableMobileEmulation`).

## Rodando

Requer Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Para um build estático (mais estável em CI): `npm run build && npm run preview` → http://localhost:4173

## Dados de teste

| Usuário | Senha | Comportamento |
|---|---|---|
| `cliente@teste.com` | `Senha@123` | Login OK |
| `bloqueado@teste.com` | `Senha@123` | "Usuário bloqueado..." |
| qualquer outro / senha errada | — | "E-mail ou senha inválidos." |

- **Cupons:** `DESCONTO10` (10%), `FRETEGRATIS`, `EXPIRADO` (erro "Cupom expirado."), outros → "Cupom inválido."
- **Frete:** R$ 19,90; grátis a partir de R$ 299,00 de subtotal.
- **Cartão:** 16 dígitos qualquer = aprovado (ex.: `4111 1111 1111 1111`); final `0000` = recusado. Validade `MM/AA` futura, CVV 3–4 dígitos.
- **CEPs mockados:** `01310-100`, `20040-002`, `30130-010`, `80010-000`, `40010-000`. Outros → "CEP não encontrado" (pode digitar manualmente).
- **CPFs válidos para cadastro:** `390.533.447-05`, `153.509.460-56` (os dos usuários seed já estão em uso).
- **Produto esgotado:** id 4 (Mouse Gamer) — botão desabilitado.
- Cadastro exige 18+ anos, senha com 8+ caracteres incluindo letras e números, e aceite dos termos.

## Flags para os testes (via URL, em qualquer página)

- `?reset=1` — limpa todos os dados (usuários cadastrados, sessão, carrinho, pedidos). Use no `[SetUp]`.
- `?delay=0` — latência simulada das chamadas "de API" em ms (padrão 600). Fica salvo no `localStorage`. Bom para treinar *explicit waits*: login, catálogo, busca de CEP, salvar cadastro e finalizar pedido mostram estado de carregamento.

Ex.: `http://localhost:5173/login?reset=1&delay=1500`

## Rotas

`/login` · `/cadastro` · `/catalogo` · `/produto/{id}` · `/carrinho` · `/checkout`* · `/pedido/{numero}`* · `/meus-pedidos`* · `/meu-cadastro`*

\* exigem login; sem sessão redirecionam para `/login?retorno=...` e voltam após o login.

## Seletores (`data-testid`)

Todos os elementos interativos têm `data-testid` (e os inputs também `id`, igual ao testid). Em C#: `By.CssSelector("[data-testid='login-email']")`.

| Tela | Seletores |
|---|---|
| Header | `header-logo`, `header-cart`, `header-cart-count`, `header-user-name`, `menu-toggle` (mobile), `nav-catalogo`, `nav-login`, `nav-register`, `nav-pedidos`, `nav-cadastro`, `nav-logout` |
| Login | `page-login`, `login-email`, `login-senha`, `login-toggle-senha`, `login-submit`, `login-error`, `login-email-error`, `login-senha-error`, `login-required-message`, `login-link-cadastro` |
| Catálogo | `page-catalogo`, `catalog-loading`, `catalog-search`, `catalog-category`, `catalog-sort`, `catalog-count`, `catalog-list`, `catalog-empty`, `catalog-clear-filters`, `product-card-{id}`, `product-name-{id}`, `product-price-{id}`, `product-category-{id}`, `product-add-{id}` |
| Produto | `page-produto`, `product-detail-name`, `product-detail-price`, `product-detail-stock`, `product-qty`, `product-qty-increase`, `product-qty-decrease`, `product-detail-add`, `product-back` |
| Carrinho | `page-carrinho`, `cart-empty`, `cart-item-{id}`, `cart-qty-{id}`, `cart-increase-{id}`, `cart-decrease-{id}`, `cart-remove-{id}`, `cart-item-total-{id}`, `cart-clear`, `coupon-input`, `coupon-apply`, `coupon-error`, `coupon-applied`, `coupon-remove`, `cart-free-shipping-hint`, `cart-checkout` |
| Resumo | `summary-subtotal`, `summary-discount`, `summary-shipping`, `summary-total` |
| Checkout | `page-checkout`, `checkout-address`, `checkout-payment-cartao` / `-pix` / `-boleto`, `checkout-card-numero`, `checkout-card-nome`, `checkout-card-validade`, `checkout-card-cvv`, `checkout-card-parcelas`, `checkout-submit`, `checkout-error`, erros: `checkout-card-{campo}-error` |
| Pedido | `page-pedido`, `order-success-title`, `order-number`, `order-status`, `order-total`, `order-payment`, `order-pix-code`, `order-boleto-code`, `orders-table`, `order-row-{numero}` |
| Cadastro | `page-cadastro`, `cadastro-{campo}` e `cadastro-{campo}-error`, `cadastro-cep-loading`, `cadastro-submit`, `cadastro-error` |
| Meu cadastro | `page-perfil`, `perfil-{campo}`, `perfil-submit`, `perfil-success` |
| Geral | `toast` (some após 3 s), `page-404` |

Campos do cliente: `nome`, `email`, `cpf`, `telefone`, `dataNascimento` (input date), `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `uf` (select), `senha`, `confirmarSenha`, `newsletter`, `aceiteTermos` (checkboxes).

> Dica: o campo `dataNascimento` é `type="date"`; no Chrome, `SendKeys` segue o formato do locale (ex.: `15051990` em pt-BR). Alternativa estável: setar via JavaScript.

## Exemplo em C# (.NET 10 + NUnit + Selenium)

```xml
<PackageReference Include="Selenium.WebDriver" Version="4.*" />
<PackageReference Include="Selenium.Support" Version="4.*" />
<PackageReference Include="NUnit" Version="4.*" />
<PackageReference Include="NUnit3TestAdapter" Version="5.*" />
<PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.*" />
```

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;

public class CompraTests
{
    const string BaseUrl = "http://localhost:5173";
    IWebDriver driver = null!;
    WebDriverWait wait = null!;

    static By Tid(string id) => By.CssSelector($"[data-testid='{id}']");

    [SetUp]
    public void SetUp()
    {
        var options = new ChromeOptions();
        // options.EnableMobileEmulation("iPhone 12 Pro"); // para testar o layout mobile
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        driver.Navigate().GoToUrl($"{BaseUrl}/login?reset=1&delay=300");
    }

    [TearDown]
    public void TearDown() => driver.Quit();

    [Test]
    public void Deve_finalizar_compra_com_cupom()
    {
        driver.FindElement(Tid("login-email")).SendKeys("cliente@teste.com");
        driver.FindElement(Tid("login-senha")).SendKeys("Senha@123");
        driver.FindElement(Tid("login-submit")).Click();

        wait.Until(d => d.FindElements(Tid("catalog-list")).Count > 0);
        driver.FindElement(Tid("product-add-1")).Click();
        Assert.That(driver.FindElement(Tid("header-cart-count")).Text, Is.EqualTo("1"));

        driver.FindElement(Tid("header-cart")).Click();
        driver.FindElement(Tid("coupon-input")).SendKeys("DESCONTO10");
        driver.FindElement(Tid("coupon-apply")).Click();
        Assert.That(driver.FindElement(Tid("summary-total")).Text, Does.Contain("244,81"));

        driver.FindElement(Tid("cart-checkout")).Click();
        driver.FindElement(Tid("checkout-card-numero")).SendKeys("4111111111111111");
        driver.FindElement(Tid("checkout-card-nome")).SendKeys("Maria Silva");
        driver.FindElement(Tid("checkout-card-validade")).SendKeys("1230");
        driver.FindElement(Tid("checkout-card-cvv")).SendKeys("123");
        new SelectElement(driver.FindElement(Tid("checkout-card-parcelas"))).SelectByValue("2");
        driver.FindElement(Tid("checkout-submit")).Click();

        var numero = wait.Until(d => d.FindElement(Tid("order-number")));
        Assert.That(numero.Text, Is.Not.Empty);
    }
}
```

(Fone R$ 249,90 − 10% = R$ 224,91 + frete R$ 19,90 = R$ 244,81.)
