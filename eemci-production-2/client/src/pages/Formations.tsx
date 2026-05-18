import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Code2,
  Smartphone,
  Network,
  Shield,
  Briefcase,
  TrendingUp,
  Hotel,
  Plane,
  ChefHat,
  BookOpen,
  Search,
  Heart,
  Clock,
  Award,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  Building2,
  Languages,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";

const LOGO_URL = "/manus-storage/logo_b4d2394c.png";
const HERO_IMG = "/manus-storage/campus_hero_97f5fc12.jpg";

type Niveau = "Technicien" | "Technicien spécialisé" | "Bachelor" | "Master" | "Doctorat";
type Domaine = "Informatique" | "Commerce" | "Management" | "Tourisme";

type Formation = {
  id: string;
  title: string;
  niveau: Niveau;
  domaine: Domaine;
  bac: string;
  duration: string;
  hours: string;
  shortDesc: string;
  longDesc: string;
  icon: typeof Code2;
  modules: string[];
  admission: string[];
  skills: string[];
  careers: string[];
  popularity: number;
};

const FORMATIONS: Formation[] = [
  {
    id: "dev-web",
    title: "Développement Web",
    niveau: "Bachelor",
    domaine: "Informatique",
    bac: "Bac+3",
    duration: "3 ans",
    hours: "2400h",
    shortDesc: "Concevez et développez des applications web modernes, du frontend au backend.",
    longDesc:
      "Une formation complète de 3 ans qui couvre l'ensemble du cycle de développement web : front-end (HTML/CSS/JavaScript, React), back-end (Node.js, PHP, bases de données), DevOps et déploiement cloud. Vous apprendrez à créer des produits numériques de qualité professionnelle.",
    icon: Code2,
    modules: [
      "HTML, CSS, JavaScript moderne",
      "Frameworks Front-end (React, Vue.js)",
      "Back-end Node.js & PHP",
      "Bases de données SQL & NoSQL",
      "DevOps, Git, CI/CD",
      "UI/UX et accessibilité",
      "Sécurité applicative",
      "Projet de fin d'études",
    ],
    admission: ["Baccalauréat scientifique ou technique", "Étude de dossier", "Entretien de motivation"],
    skills: [
      "Maîtrise des langages web modernes",
      "Architecture d'applications web",
      "Travail en équipe agile",
      "Déploiement en production",
    ],
    careers: ["Développeur Full-Stack", "Front-end Developer", "Back-end Developer", "Tech Lead Junior"],
    popularity: 95,
  },
  {
    id: "dev-mobile",
    title: "Développement Mobile",
    niveau: "Bachelor",
    domaine: "Informatique",
    bac: "Bac+3",
    duration: "3 ans",
    hours: "2400h",
    shortDesc: "Créez des applications mobiles natives et cross-platform pour iOS et Android.",
    longDesc:
      "Spécialisez-vous dans la création d'applications mobiles performantes et élégantes. La formation couvre le développement natif (Swift, Kotlin) et cross-platform (React Native, Flutter), ainsi que la publication sur les stores.",
    icon: Smartphone,
    modules: [
      "Swift & développement iOS",
      "Kotlin & développement Android",
      "React Native & Flutter",
      "API REST & GraphQL",
      "UX mobile",
      "Performance & sécurité",
      "Publication App Store / Play Store",
    ],
    admission: ["Baccalauréat scientifique ou technique", "Étude de dossier", "Test de logique"],
    skills: ["Apps natives iOS/Android", "Apps cross-platform", "Optimisation des performances", "Design mobile"],
    careers: ["Mobile Developer", "iOS Developer", "Android Developer", "Architecte mobile"],
    popularity: 88,
  },
  {
    id: "reseaux",
    title: "Réseaux Informatiques",
    niveau: "Technicien spécialisé",
    domaine: "Informatique",
    bac: "Bac+2",
    duration: "2 ans",
    hours: "2000h",
    shortDesc: "Devenez expert en administration des réseaux d'entreprise et infrastructures cloud.",
    longDesc:
      "Formation pratique axée sur l'administration des réseaux locaux et étendus, la virtualisation, le cloud et la sécurité. Préparation aux certifications Cisco CCNA et équivalents.",
    icon: Network,
    modules: [
      "Architecture réseau (TCP/IP, OSI)",
      "Routage & commutation Cisco",
      "Administration Linux & Windows Server",
      "Virtualisation (VMware, Hyper-V)",
      "Cloud (AWS, Azure)",
      "Sécurité réseau",
      "Stage de fin d'études",
    ],
    admission: ["Baccalauréat", "Étude de dossier"],
    skills: ["Administration réseau", "Configuration équipements", "Cloud & virtualisation", "Sécurité"],
    careers: ["Administrateur réseau", "Technicien systèmes", "Cloud Engineer Junior"],
    popularity: 78,
  },
  {
    id: "cybersecurity",
    title: "Cybersécurité",
    niveau: "Master",
    domaine: "Informatique",
    bac: "Bac+5",
    duration: "2 ans",
    hours: "1800h",
    shortDesc: "Protégez les systèmes d'information contre les menaces actuelles et émergentes.",
    longDesc:
      "Master de spécialisation en cybersécurité couvrant la sécurité offensive (pentesting), défensive (SOC, forensics), la cryptographie et la conformité (RGPD, ISO 27001).",
    icon: Shield,
    modules: [
      "Sécurité offensive & pentesting",
      "Forensics & investigation numérique",
      "Cryptographie appliquée",
      "Sécurité des applications web",
      "SIEM & SOC",
      "Conformité (RGPD, ISO 27001)",
      "Mémoire de recherche",
    ],
    admission: ["Bachelor en informatique", "Entretien & test technique"],
    skills: ["Pentesting", "Analyse forensique", "Audit de sécurité", "Gestion d'incidents"],
    careers: ["Pentester", "Analyste SOC", "Consultant cybersécurité", "RSSI Junior"],
    popularity: 92,
  },
  {
    id: "marketing-commerce",
    title: "Marketing & Commerce",
    niveau: "Bachelor",
    domaine: "Commerce",
    bac: "Bac+3",
    duration: "3 ans",
    hours: "2200h",
    shortDesc: "Maîtrisez les stratégies de marketing digital et de commerce international.",
    longDesc:
      "Formation orientée vers le marketing digital, les techniques de vente, la communication 360° et le commerce international. Les étudiants réalisent plusieurs projets concrets avec des entreprises partenaires.",
    icon: TrendingUp,
    modules: [
      "Marketing digital & SEO/SEA",
      "Communication & branding",
      "Techniques de vente",
      "Études de marché",
      "Commerce international",
      "Droit commercial",
      "Anglais des affaires",
      "Stage en entreprise",
    ],
    admission: ["Baccalauréat", "Étude de dossier", "Entretien"],
    skills: ["Stratégie marketing", "Campagnes digitales", "Négociation", "Analyse de marché"],
    careers: ["Chef de produit", "Responsable marketing digital", "Commercial B2B/B2C"],
    popularity: 85,
  },
  {
    id: "management",
    title: "Management des Entreprises",
    niveau: "Master",
    domaine: "Management",
    bac: "Bac+5",
    duration: "2 ans",
    hours: "1800h",
    shortDesc: "Pilotez la stratégie et la performance d'une organisation à l'international.",
    longDesc:
      "Master de management généraliste à orientation internationale. Stratégie, finance, RH, leadership et entrepreneuriat. Échanges et projets avec des entreprises partenaires européennes.",
    icon: Briefcase,
    modules: [
      "Stratégie d'entreprise",
      "Finance & contrôle de gestion",
      "Management des RH",
      "Leadership & change management",
      "Entrepreneuriat",
      "Business intelligence",
      "Mémoire de fin d'études",
    ],
    admission: ["Bachelor (toutes filières)", "Test d'admission", "Entretien"],
    skills: ["Pilotage stratégique", "Leadership d'équipe", "Décision financière", "Management interculturel"],
    careers: ["Manager d'équipe", "Consultant en stratégie", "Chef de projet", "Entrepreneur"],
    popularity: 80,
  },
  {
    id: "compta-finance",
    title: "Comptabilité & Finance",
    niveau: "Technicien spécialisé",
    domaine: "Commerce",
    bac: "Bac+2",
    duration: "2 ans",
    hours: "2000h",
    shortDesc: "Devenez professionnel de la comptabilité et de la gestion financière.",
    longDesc:
      "Formation technique solide en comptabilité générale, analytique, fiscalité marocaine et gestion budgétaire. Maîtrise des logiciels SAGE et Excel avancé.",
    icon: Award,
    modules: [
      "Comptabilité générale & analytique",
      "Fiscalité marocaine",
      "Gestion budgétaire",
      "Logiciels SAGE",
      "Excel avancé",
      "Audit & contrôle interne",
      "Stage en cabinet",
    ],
    admission: ["Baccalauréat", "Étude de dossier"],
    skills: ["Tenue de comptabilité", "Déclarations fiscales", "Reporting financier"],
    careers: ["Comptable", "Aide-comptable", "Assistant audit", "Gestionnaire de paie"],
    popularity: 70,
  },
  {
    id: "hotellerie",
    title: "Gestion Hôtelière",
    niveau: "Bachelor",
    domaine: "Tourisme",
    bac: "Bac+3",
    duration: "3 ans",
    hours: "2400h",
    shortDesc: "Pilotez les opérations d'un établissement hôtelier de standing international.",
    longDesc:
      "Formation aux métiers de l'hôtellerie haut de gamme : gestion des opérations, accueil, restauration, marketing hôtelier. Stages dans des hôtels partenaires nationaux et internationaux.",
    icon: Hotel,
    modules: [
      "Front office & accueil",
      "Housekeeping & opérations",
      "Restauration & F&B",
      "Marketing hôtelier",
      "Gestion financière hôtelière",
      "Anglais & langues étrangères",
      "Stages opérationnels",
    ],
    admission: ["Baccalauréat", "Entretien", "Bonne maîtrise des langues"],
    skills: ["Management opérationnel", "Service client premium", "Gestion d'équipe", "Marketing hôtelier"],
    careers: ["Réceptionniste senior", "Chef de réception", "Assistant directeur d'hôtel"],
    popularity: 75,
  },
  {
    id: "tourisme",
    title: "Tourisme & Voyages",
    niveau: "Technicien spécialisé",
    domaine: "Tourisme",
    bac: "Bac+2",
    duration: "2 ans",
    hours: "2000h",
    shortDesc: "Concevez des expériences de voyage uniques et accompagnez les voyageurs.",
    longDesc:
      "Formation aux métiers des agences de voyages, du tour-operating et du tourisme culturel. Découverte du patrimoine marocain et des destinations internationales.",
    icon: Plane,
    modules: [
      "Géographie touristique",
      "Patrimoine du Maroc",
      "Billetterie & GDS (Amadeus)",
      "Conception de circuits",
      "Marketing touristique",
      "Langues étrangères",
      "Stage en agence",
    ],
    admission: ["Baccalauréat", "Étude de dossier", "Entretien"],
    skills: ["Conseil voyageurs", "Conception de circuits", "Vente de prestations"],
    careers: ["Conseiller voyages", "Agent de réservation", "Guide touristique"],
    popularity: 68,
  },
  {
    id: "restauration",
    title: "Arts Culinaires & Restauration",
    niveau: "Technicien",
    domaine: "Tourisme",
    bac: "Bac",
    duration: "1 an",
    hours: "1200h",
    shortDesc: "Apprenez les fondamentaux de la cuisine et du service en restauration.",
    longDesc:
      "Formation pratique intensive aux arts culinaires marocains et internationaux, ainsi qu'au service en salle. Cours en cuisine pédagogique et stages en restaurants.",
    icon: ChefHat,
    modules: [
      "Cuisine marocaine traditionnelle",
      "Cuisine internationale",
      "Pâtisserie & boulangerie",
      "Service en salle",
      "Hygiène & HACCP",
      "Gestion d'un point de restauration",
      "Stage en restaurant",
    ],
    admission: ["Niveau Bac", "Étude de dossier"],
    skills: ["Techniques culinaires", "Service en salle", "Hygiène alimentaire"],
    careers: ["Cuisinier", "Commis de cuisine", "Serveur", "Chef de rang"],
    popularity: 60,
  },
  {
    id: "doctorat-mgmt",
    title: "Doctorat en Sciences de Gestion",
    niveau: "Doctorat",
    domaine: "Management",
    bac: "Bac+8",
    duration: "3 à 5 ans",
    hours: "Recherche",
    shortDesc: "Menez des travaux de recherche de pointe en sciences de gestion et publiez.",
    longDesc:
      "Programme doctoral en partenariat avec des universités européennes. Encadrement personnalisé, séminaires de recherche, publications dans des revues scientifiques internationales.",
    icon: BookOpen,
    modules: [
      "Méthodologie de la recherche",
      "Analyse quantitative & qualitative",
      "Séminaires doctoraux",
      "Publications scientifiques",
      "Conférences internationales",
      "Soutenance de thèse",
    ],
    admission: ["Master en management ou équivalent", "Projet de recherche", "Entretien avec le directeur de thèse"],
    skills: ["Recherche scientifique", "Publication académique", "Enseignement supérieur"],
    careers: ["Enseignant-chercheur", "Consultant senior", "Expert en stratégie"],
    popularity: 50,
  },
];

const NIVEAUX: Niveau[] = ["Technicien", "Technicien spécialisé", "Bachelor", "Master", "Doctorat"];
const DOMAINES: Domaine[] = ["Informatique", "Commerce", "Management", "Tourisme"];

const NIVEAU_ORDER: Record<Niveau, number> = {
  Technicien: 1,
  "Technicien spécialisé": 2,
  Bachelor: 3,
  Master: 4,
  Doctorat: 5,
};

export default function Formations() {
  const [niveau, setNiveau] = useState<Niveau | "all">("all");
  const [domaine, setDomaine] = useState<Domaine | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"popular" | "niveau-asc" | "title">("popular");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("eemci-favs") || "[]");
    } catch {
      return [];
    }
  });
  const [active, setActive] = useState<Formation | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"fr" | "ar">("fr");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("eemci-favs", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFav = (id: string) =>
    setFavorites((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const results = useMemo(() => {
    let r = FORMATIONS.filter((f) => {
      if (niveau !== "all" && f.niveau !== niveau) return false;
      if (domaine !== "all" && f.domaine !== domaine) return false;
      if (query && !f.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    if (sort === "popular") r.sort((a, b) => b.popularity - a.popularity);
    else if (sort === "niveau-asc") r.sort((a, b) => NIVEAU_ORDER[a.niveau] - NIVEAU_ORDER[b.niveau]);
    else if (sort === "title") r.sort((a, b) => a.title.localeCompare(b.title));

    return r;
  }, [niveau, domaine, query, sort]);

  const isAr = lang === "ar";

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
          <Link href="/">
            <a className="flex items-center gap-2 shrink-0">
              <span
                className={`inline-flex rounded-md transition-all ${
                  scrolled ? "" : "bg-white/95 px-2 py-1 shadow-sm"
                }`}
              >
                <img src={LOGO_URL} alt="EEMCI" className="h-8 w-auto" />
              </span>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link href="/">
              <a className={`px-3 py-2 rounded-md transition-colors ${
                scrolled
                  ? "text-foreground/80 hover:text-foreground hover:bg-accent"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}>
                Accueil
              </a>
            </Link>
            <a href="#" className={`px-3 py-2 rounded-md transition-colors ${
              scrolled
                ? "text-foreground/80 hover:text-foreground hover:bg-accent"
                : "text-white/90 hover:text-white hover:bg-white/10"
            }`}>
              Formations
            </a>
          </nav>

          <div className="flex items-center gap-2">
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

        {mobileMenuOpen && (
          <nav className="md:hidden bg-background/95 backdrop-blur border-b">
            <div className="px-4 py-4 space-y-2">
              <Link href="/">
                <a className="block px-3 py-2 rounded-md text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
                   onClick={() => setMobileMenuOpen(false)}>
                  Accueil
                </a>
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-[50vh] flex items-center pt-20 overflow-hidden isolate">
        <img
          src={HERO_IMG}
          alt="Formations"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/75 to-blue-800/40 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl text-white animate-slide-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              Nos Formations
            </h1>
            <p className="text-lg sm:text-xl text-blue-50/90 leading-relaxed">
              Découvrez nos programmes du Technicien au Doctorat
            </p>
          </div>
        </div>
      </section>

      {/* FILTERS & SEARCH */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher une formation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Niveau Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Niveau</label>
                <select
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value as Niveau | "all")}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tous les niveaux</option>
                  {NIVEAUX.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Domaine Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Domaine</label>
                <select
                  value={domaine}
                  onChange={(e) => setDomaine(e.target.value as Domaine | "all")}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tous les domaines</option>
                  {DOMAINES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Trier par</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="popular">Populaire</option>
                  <option value="niveau-asc">Niveau (croissant)</option>
                  <option value="title">Titre (A-Z)</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <p className="text-sm text-muted-foreground">
                  {results.length} formation{results.length > 1 ? "s" : ""} trouvée{results.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMATIONS GRID */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Aucune formation ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((f, idx) => {
                const Icon = f.icon;
                const isFav = favorites.includes(f.id);
                return (
                  <div
                    key={f.id}
                    className="group bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 animate-scale-in cursor-pointer"
                    style={{ animationDelay: `${(idx % 6) * 50}ms` }}
                    onClick={() => setActive(f)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="inline-flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFav(f.id);
                          }}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge text-xs">{f.niveau}</span>
                          <span className="badge text-xs">{f.domaine}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.shortDesc}</p>
                      </div>

                      <div className="space-y-2 mb-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span>{f.bac}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{f.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-primary" />
                          <span>{f.hours}</span>
                        </div>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActive(f);
                        }}
                        className="w-full bg-primary text-white hover:bg-primary/90"
                      >
                        Voir détails
                        <ChevronRight className="w-4 h-4 ms-2" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* DETAILS MODAL */}
      {active && (
        <Dialog open={!!active} onOpenChange={() => setActive(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="inline-flex w-10 h-10 rounded-lg bg-primary/10 text-primary items-center justify-center">
                  {active.icon && <active.icon className="w-5 h-5" />}
                </div>
                {active.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <span className="badge">{active.niveau}</span>
                <span className="badge">{active.domaine}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Overview */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Aperçu
                </h4>
                <p className="text-sm text-muted-foreground">{active.longDesc}</p>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-accent/50">
                  <p className="text-xs text-muted-foreground mb-1">Niveau</p>
                  <p className="font-semibold">{active.bac}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/50">
                  <p className="text-xs text-muted-foreground mb-1">Durée</p>
                  <p className="font-semibold">{active.duration}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/50">
                  <p className="text-xs text-muted-foreground mb-1">Volume</p>
                  <p className="font-semibold">{active.hours}</p>
                </div>
              </div>

              {/* Modules */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Modules
                </h4>
                <ul className="space-y-2">
                  {active.modules.map((m) => (
                    <li key={m} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Admission */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Conditions d'admission
                </h4>
                <ul className="space-y-2">
                  {active.admission.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Compétences acquises
                </h4>
                <ul className="space-y-2">
                  {active.skills.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Careers */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Débouchés professionnels
                </h4>
                <ul className="space-y-2">
                  {active.careers.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-primary text-white hover:bg-primary/90">
                  S'inscrire
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => toggleFav(active.id)}
                >
                  <Heart className={`w-4 h-4 me-2 ${
                    favorites.includes(active.id) ? "fill-red-500 text-red-500" : ""
                  }`} />
                  {favorites.includes(active.id) ? "Favori" : "Ajouter aux favoris"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-12 mt-20">
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
                <li><Link href="/"><a className="hover:text-white transition-colors">Accueil</a></Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Formations</a></li>
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
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-slate-400">contact@eemci.ma</p>
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
