import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, ArrowUpRight, Menu } from "lucide-react";

import luandaImage from "@/assets/favela-angolana-luanda.jpg";
import moambaImage from "@/assets/favela-angolana-moamba.jpg";
import musicImage from "@/assets/favela-angolana-musica.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Favela Angolana — Cultura que nasce na rua" },
      {
        name: "description",
        content:
          "Um olhar próximo sobre a vida, os sabores e os sons das comunidades angolanas, a começar por Luanda.",
      },
      { property: "og:title", content: "Favela Angolana — Cultura que nasce na rua" },
      {
        property: "og:description",
        content: "Histórias, sabores e música das comunidades angolanas, a começar por Luanda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="culture-page">
      <div className="city-ribbon">
        <span>Luanda, Angola</span>
        <span className="ribbon-mark" aria-hidden="true">✳</span>
        <span>Da rua para o mundo</span>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#inicio" aria-label="Favela Angolana — início">
          <span>FAVELA</span>
          <span className="wordmark-second">ANGOLANA<span className="wordmark-dot">.</span></span>
        </a>
        <nav className="main-nav" aria-label="Navegação principal">
          <a href="#cidade">A cidade</a>
          <a href="#mesa">À mesa</a>
          <a href="#som">O som</a>
        </nav>
        <Button asChild variant="outline" className="header-cta">
          <a href="#sobre">Conheça o projecto <ArrowUpRight aria-hidden="true" /></a>
        </Button>
        <a className="mobile-menu" href="#cidade" aria-label="Explorar a página">
          <Menu aria-hidden="true" />
        </a>
      </header>

      <section className="opening" id="inicio" aria-labelledby="opening-title">
        <img
          className="opening-image"
          src={luandaImage}
          alt="Rua colorida de Luanda, com moradores e a cidade ao fundo"
          width={1536}
          height={1024}
          fetchPriority="high"
        />
        <div className="opening-shade" />
        <div className="opening-content">
          <p className="eyebrow opening-eyebrow"><span /> Cultura viva, sem filtros</p>
          <h1 id="opening-title">A cidade<br />tem muitas<br /><em>vozes.</em></h1>
          <div className="opening-bottom">
            <p>Histórias, sabores e sons<br className="desktop-break" /> de uma Angola feita por quem cá vive.</p>
            <Button asChild variant="secondary" className="opening-button">
              <a href="#cidade">Entrar na conversa <ArrowDown aria-hidden="true" /></a>
            </Button>
          </div>
        </div>
        <span className="opening-index">08°49′ S&nbsp; / &nbsp;13°14′ E</span>
      </section>

      <section className="intro-band" id="sobre">
        <p className="eyebrow"><span className="eyebrow-star">✳</span> Um lugar para as nossas histórias</p>
        <p className="intro-copy">A cultura não se conta de longe.<br />Sente-se <em>na rua, à mesa, no batuque.</em></p>
        <p className="intro-note">A Favela Angolana é um olhar próximo sobre a vida que se inventa todos os dias, começando pelos bairros de Luanda.</p>
      </section>

      <section className="stories-section page-gutter" id="cidade">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span /> Caderno da cidade</p>
            <h2>O que pulsa<br />por <em>aqui.</em></h2>
          </div>
          <p className="heading-aside">Cada bairro tem o seu ritmo.<br />Estas são algumas das suas expressões.</p>
        </div>

        <div className="story-grid">
          <a className="story-card story-card-main" href="#som">
            <div className="story-image-wrap">
              <img src={musicImage} alt="Amigos partilham música e tocam guitarra num encontro de bairro" width={1280} height={1024} loading="lazy" />
              <span className="image-arrow"><ArrowUpRight aria-hidden="true" /></span>
            </div>
            <div className="story-caption">
              <p className="eyebrow">01 <span className="caption-rule" /> Música de encontro</p>
              <h3>O som que junta<br />a vizinhança.</h3>
              <p>Na guitarra, na palma e na conversa que nunca acaba.</p>
            </div>
          </a>

          <a className="story-card story-card-food" href="#mesa">
            <div className="story-image-wrap">
              <img src={moambaImage} alt="Moamba de galinha com quiabos, acompanhada de funge" width={1200} height={912} loading="lazy" />
              <span className="image-arrow"><ArrowUpRight aria-hidden="true" /></span>
            </div>
            <div className="story-caption">
              <p className="eyebrow">02 <span className="caption-rule" /> Sabores de casa</p>
              <h3>Uma mesa que<br />conta histórias.</h3>
              <p>Receitas passadas de mão em mão, com tempo e cuidado.</p>
            </div>
          </a>

          <div className="city-note-card">
            <span className="note-ornament" aria-hidden="true">“</span>
            <p>Não é só um lugar.<br />É uma maneira de<br /><em>estar junto.</em></p>
            <span className="note-signature">Luanda, todos os dias</span>
            <a href="#sobre" aria-label="Saiba mais sobre a Favela Angolana"><ArrowRight aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section className="table-section" id="mesa">
        <div className="table-photo">
          <img src={moambaImage} alt="Prato de moamba de galinha servido à mesa" width={1200} height={912} loading="lazy" />
          <span className="photo-caption">DA COZINHA DE CASA</span>
        </div>
        <div className="table-copy">
          <p className="eyebrow"><span /> Caderno de sabores</p>
          <h2>O sabor de<br />ficar mais<br /><em>um pouco.</em></h2>
          <p>Na cozinha angolana, há sempre espaço para mais um. A moamba, o funge, o cheiro que vem da panela — são sabores que carregam histórias, lugares e gente.</p>
          <a className="text-link" href="#cidade">À mesa, como em casa <ArrowRight aria-hidden="true" /></a>
          <span className="table-stamp" aria-hidden="true">BOM<br />PROVEITO<span>✳</span></span>
        </div>
      </section>

      <section className="sound-section page-gutter" id="som">
        <div className="sound-heading">
          <p className="eyebrow"><span /> Caderno de sons</p>
          <h2>O bairro<br />também <em>dança.</em></h2>
          <p>Há uma batida que atravessa gerações. Ora chega mansa, ora chama toda a gente para o centro.</p>
          <a className="text-link" href="#sobre">Ouça com atenção <ArrowRight aria-hidden="true" /></a>
        </div>
        <div className="sound-photo">
          <img src={musicImage} alt="Roda de amigos a tocar música num bairro de Luanda" width={1280} height={1024} loading="lazy" />
          <span className="sound-photo-label">O SOM DA RUA <span>✳</span></span>
        </div>
        <span className="sound-asterisk" aria-hidden="true">✳</span>
      </section>

      <footer className="site-footer">
        <a className="wordmark footer-wordmark" href="#inicio" aria-label="Favela Angolana — voltar ao início">
          <span>FAVELA</span><span className="wordmark-second">ANGOLANA<span className="wordmark-dot">.</span></span>
        </a>
        <p>Feito com amor, em Angola.<br />As histórias continuam na rua.</p>
        <a className="back-top" href="#inicio">Voltar ao início <ArrowUpRight aria-hidden="true" /></a>
        <span className="footer-sun" aria-hidden="true">✳</span>
      </footer>
    </main>
  );
}
