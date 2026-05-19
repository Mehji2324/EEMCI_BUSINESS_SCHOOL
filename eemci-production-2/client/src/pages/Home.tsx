1import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Briefcase,
  Hotel,
  Code2,
  TrendingUp,
  Award,
  UserCheck,
  Target,
  Handshake,
  Building2,
  Lightbulb,
  Calendar,
  Megaphone,
  ChevronRight,
  Languages,
  Menu,
  X,
} from "lucide-react";

// Asset URLs from webdev storage
const LOGO_URL = "/manus-storage/logo_b4d2394c.png";
const HERO_IMG = "/manus-storage/campus_hero_97f5fc12.jpg";
const STUDENTS_IMG = "/manus-storage/students_group_21fc4098.jpg";
const CLASSROOM_IMG = "/manus-storage/classroom_21852b4c.jpg";
const ACTIVITY_IMG = "/manus-storage/tech_activity_997fdf99.jpg";
const EVENT_IMG = "/manus-storage/graduation_event_025b1237.jpg";
const IT_IMG = "/manus-storage/it_filiere_68a5c12a.jpg";
const BUSINESS_IMG = "/manus-storage/business_filiere_09d5a1cd.jpg";
const HOTEL_IMG = "/manus-storage/hotel_filiere_221f0b5e.jpg";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"fr" | "ar">("fr");

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Check if user is logged in
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAr = lang === "ar";
  
  const getDashboardUrl = (role: string) => {
    if (role === 'admin') return 'admin-dashboard.html';
    if (role === 'professor') return 'professor-dashboard.html';
    return 'dashboard.html';
  };

  const stats = [
    { icon: GraduationCap, value: "+1200", label: "Étudiants formés" },
    { icon: TrendingUp, value: "85%", label: "Taux de réussite" },
    { icon: Award, value: "+10", label: "Promotions diplômées" },
    { icon: UserCheck, value: "+25", label: "Enseignants qualifiés" },
  ];

  const filieres = [
    {
      icon: Code2,
      img: IT_IMG,
      title: "Informatique & IT",
      desc: "Développement, réseaux, cybersécurité et nouvelles technologies pour préparer les talents du numérique.",
    },
    {
      icon: Briefcase,
      img: BUSINESS_IMG,
      title: "Management & Commerce",
      desc: "Gestion d'entreprise, marketing, finance et commerce international pour former les managers de demain.",
    },
    {
      icon: Hotel,
      img: HOTEL_IMG,
      title: "Hôtellerie & Tourisme",
      desc: "Métiers de l'accueil, gestion hôtelière et tourisme international au cœur d'un secteur d'avenir.",
    },
  ];

  const points = [
    { icon: Target, title: "Formation orientée pratique", desc: "Apprentissage par projets et études de cas réels." },
    { icon: Handshake, title: "Encadrement personnalisé", desc: "Suivi individuel et coaching tout au long du cursus." },
    { icon: Building2, title: "Stages en entreprise", desc: "Partenariats avec des entreprises locales et internationales." },
    { icon: Lightbulb, title: "Préparation au marché du travail", desc: "Compétences techniques et soft skills pour l'emploi." },
  ];

  const galleryImgs = [
    { src: CLASSROOM_IMG, label: "Salles de classe" },
    { src: STUDENTS_IMG, label: "Étudiants" },
    { src: ACTIVITY_IMG, label: "Activités" },
    { src: EVENT_IMG, label: "Événements" },
  ];

  const news = [
    {
      tag: "Événement",
      icon: Calendar,
      title: "Forum Carrières & Entreprises 2026",
      date: "15 mai 2026",
      desc: "Une journée de rencontres avec plus de 30 entreprises partenaires pour découvrir des opportunités de stages et d'emplois.",
    },
    {
      tag: "Annonce",
      icon: Megaphone,
      title: "Inscriptions ouvertes — Rentrée 2026",
      date: "Jusqu'au 30 juillet 2026",
      desc: "Les inscriptions pour la prochaine rentrée académique sont désormais ouvertes pour toutes nos filières.",
    },
    {
      tag: "Activité",
      icon: Award,
      title: "Hackathon EEMCI 2026",
      date: "8-10 juin 2026",
      desc: "48 heures d'innovation et de créativité où les étudiants relèvent des défis technologiques concrets.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isAr ? "rtl" : "ltr"}>
      {/* NAVBAR */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur border-b shadow-sm text-foreground"
            : "bg-transparent text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <a href="#hero" className="flex items-center gap-2 shrink-0 group">
            <span
              className={`inline-flex rounded-md transition-all ${
                scrolled ? "" : "bg-white/95 px-2 py-1 shadow-sm"
              }`}
            >
              <img src={LOGO_URL} alt="EEMCI" className="h-8 w-auto" />
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {[
              { href: "#hero", label: "Accueil" },
              { href: "#about", label: "À propos" },
              { href: "/formations", label: "Formations" },
              { href: "#gallery", label: "Galerie" },
              { href: "#news", label: "Actualités" },
              { href: "#contact", label: "Contact" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                  scrolled
                    ? "text-foreground/80 hover:text-foreground hover:bg-accent"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <a href={getDashboardUrl(user.role)}>
                <Button
                  variant={scrolled ? "default" : "outline"}
                  size="sm"
                  className={scrolled ? "" : "bg-white/10 border-white/40 text-white hover:bg-white/20"}
                >
                  Tableau de bord
                </Button>
              </a>
            ) : (
              <a href="/login">
                <Button
                  variant={scrolled ? "default" : "outline"}
                  size="sm"
                  className={scrolled ? "" : "bg-white/10 border-white/40 text-white hover:bg-white/20"}
                >
                  Connexion
                </Button>
              </a>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(isAr ? "fr" : "ar")}
              className={`transition-colors ${
                scrolled ? "" : "text-white hover:bg-white/10 hover:text-white"
              }`}
            >
              <Languages className="w-4 h-4 me-2" />
              {isAr ? "Français" : "العربية"}
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-background/95 backdrop-blur border-b">
            <div className="px-4 py-4 space-y-2">
              {[
                { href: "#hero", label: "Accueil" },
                { href: "#about", label: "À propos" },
                { href: "/formations", label: "Formations" },
                { href: "#gallery", label: "Galerie" },
                { href: "#news", label: "Actualités" },
                { href: "#contact", label: "Contact" },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="block px-3 py-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* HERO SECTION */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center pt-20 overflow-hidden isolate"
      >
        <img
          src={HERO_IMG}
          alt="Campus EEMCI"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/75 to-blue-800/40 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl text-white animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-medium mb-6 border border-white/20 animate-pulse-glow">
              <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
              École supérieure privée — Meknès
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Bienvenue à <span className="text-blue-200">EEMCI</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-blue-50/90 leading-relaxed max-w-2xl">
              L'École Européenne de Management, Commerce & IT et d'Hôtellerie & Tourisme à Meknès.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {user ? (
                <a href={getDashboardUrl(user.role)}>
                  <Button
                    size="lg"
                    className="bg-white text-blue-900 hover:bg-blue-50 h-12 px-6 text-base font-semibold transition-all active:scale-95"
                  >
                    Mon Tableau de bord
                    <ChevronRight className={`w-5 h-5 ${isAr ? "me-2 rotate-180" : "ms-2"}`} />
                  </Button>
                </a>
              ) : (
                <a href="/login">
                  <Button
                    size="lg"
                    className="bg-white text-blue-900 hover:bg-blue-50 h-12 px-6 text-base font-semibold transition-all active:scale-95"
                  >
                    Connexion à l'espace étudiant
                    <ChevronRight className={`w-5 h-5 ${isAr ? "me-2 rotate-180" : "ms-2"}`} />
                  </Button>
                </a>
              )}
              <a href="#about">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base bg-transparent border-white/40 text-white hover:bg-white/10 transition-all active:scale-95"
                >
                  En savoir plus
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-20 sm:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-left">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              À propos de nous
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              Une école au service de votre avenir
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                L'École Européenne de Management, Commerce & IT et d'Hôtellerie & Tourisme (EEMCI),
                située à Meknès, est un établissement d'enseignement supérieur privé dédié à la formation
                des étudiants dans des domaines clés du marché du travail.
              </p>
              <p>
                Depuis sa création en <span className="font-semibold text-foreground">2015</span>, EEMCI s'est
                donnée pour mission de former des profils compétents, capables de répondre aux exigences du monde
                professionnel, tant au niveau national qu'international.
              </p>
              <p>
                L'école a déjà formé plus de <span className="font-semibold text-foreground">1200 étudiants</span> depuis
                son ouverture, avec plusieurs promotions qui ont intégré avec succès le marché de l'emploi ou poursuivi
                leurs études supérieures.
              </p>
            </div>
          </div>

          <div className="relative animate-slide-right">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-blue-300/10 rounded-3xl blur-2xl" />
            <img
              src={STUDENTS_IMG}
              alt="Étudiants EEMCI"
              className="relative rounded-2xl shadow-xl object-cover w-full aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="text-center animate-scale-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="inline-flex w-14 h-14 rounded-2xl bg-white/10 items-center justify-center mb-4 backdrop-blur">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold">{s.value}</div>
                <div className="text-blue-100 mt-1 text-sm sm:text-base">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FILIERES SECTION */}
      <section id="filieres" className="py-20 sm:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-slide-up">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Nos filières
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Des formations adaptées au marché
            </h2>
            <p className="mt-4 text-muted-foreground">
              Trois pôles d'excellence pour bâtir une carrière solide et internationale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {filieres.map((f, idx) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.title}
                  className="overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={f.img}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="inline-flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* POINTS FORTS SECTION */}
      <section className="py-20 sm:py-28 bg-blue-50/60 dark:bg-blue-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-slide-up">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Nos atouts
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Pourquoi choisir EEMCI ?</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {points.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="bg-card border rounded-2xl p-6 hover:shadow-md transition-all animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="inline-flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold mb-2">{p.title}</h4>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="py-20 sm:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-slide-up">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Galerie
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Découvrez notre campus
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryImgs.map((img, idx) => (
              <div
                key={img.label}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer animate-scale-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <img
                  src={img.src}
                  alt={img.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                  <p className="text-white font-semibold p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {img.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS SECTION */}
      <section id="news" className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-900/50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-slide-up">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Actualités
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Dernières nouvelles
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {news.map((n, idx) => {
              const Icon = n.icon;
              return (
                <Card
                  key={n.title}
                  className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="badge">{n.tag}</span>
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{n.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{n.date}</p>
                    <p className="text-sm leading-relaxed">{n.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 sm:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-slide-up">
            <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Contact
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Nous contacter
            </h2>
            <p className="mt-4 text-muted-foreground">
              Avez-vous des questions ? Notre équipe est là pour vous aider.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="text-center animate-scale-in">
              <CardContent className="p-6">
                <div className="inline-flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Adresse</h4>
                <p className="text-sm text-muted-foreground">Meknès, Maroc</p>
              </CardContent>
            </Card>

            <Card className="text-center animate-scale-in" style={{ animationDelay: "100ms" }}>
              <CardContent className="p-6">
                <div className="inline-flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Téléphone</h4>
                <p className="text-sm text-muted-foreground">+212 5XX XXX XXX</p>
              </CardContent>
            </Card>

            <Card className="text-center animate-scale-in" style={{ animationDelay: "200ms" }}>
              <CardContent className="p-6">
                <div className="inline-flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-sm text-muted-foreground">contact@eemci.ma</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">EEMCI</h4>
              <p className="text-sm text-slate-400">
                L'École Européenne de Management, Commerce & IT et d'Hôtellerie & Tourisme.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#hero" className="hover:text-white transition-colors">Accueil</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="/formations" className="hover:text-white transition-colors">Formations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Réseaux sociaux</h4>
              <p className="text-sm text-slate-400">Suivez-nous sur nos réseaux sociaux.</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2026 EEMCI. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
