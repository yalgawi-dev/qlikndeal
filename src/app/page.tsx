import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Shield, Truck } from "lucide-react";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-start pt-2 pb-12 md:pt-8 md:pb-24 relative overflow-hidden min-h-[calc(100vh-4rem)]">
                {/* Background Gradients */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 animate-pulse" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] -z-10" />

                <div className="container px-4 text-center max-w-5xl space-y-8 relative z-10 flex flex-col h-full">

                    {/* Revolution Badge */}
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold tracking-wider uppercase text-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            המהפכה בעסקאות יד-שנייה
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent drop-shadow-sm font-['Outfit'] leading-tight">
                        Qlik<span className="text-primary font-light">n</span>deal
                        <br />
                        <span className="font-sans text-4xl md:text-7xl mt-4 block bg-none text-white font-black tracking-normal">
                            הצלע החסרה<br className="md:hidden" /> לכל עסקה
                        </span>
                    </h1>

                    <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
                        המהפכה שמשלימה את העסקה.
                        <br />
                        מצאתם מוצר בפייסבוק או ביד-2? אנחנו נדאג לכל השאר:
                        <span className="font-medium text-foreground"> איסוף, בדיקה, תשלום מוגן ושילוח עד הבית.</span>
                        <br />
                        הופכים כל מודעה לעסקה בטוחה בלחיצת כפתור.
                    </p>

                    <div className="flex-1" /> {/* Spacer to push buttons down */}

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-auto pb-10">
                        <Link href="/trust-link">
                            <Button size="lg" className="h-16 px-10 text-xl shadow-[0_0_50px_-12px_hsl(var(--primary))] rounded-full">
                                עסקה בקליק <ArrowRight className="mr-2 h-6 w-6" />
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button size="lg" variant="outline" className="h-16 px-10 text-xl rounded-full border-2">
                                כניסה לחשבון
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section (New) */}
            <section className="py-24 bg-background border-t border-border/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10" />
                <div className="container px-4 max-w-5xl text-center space-y-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide mb-4">
                        <span className="text-xl">🌟</span>
                        <span>החזון שלנו</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent font-['Outfit']">
                        להפוך את האינטרנט <br /> <span className="text-primary">למקום בטוח יותר</span>
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        אנחנו לא עוד חברת שליחויות, ואנחנו לא עוד לוח מודעות. <br />
                        <strong>Qlikndeal</strong> נולדה מתוך צורך אמיתי לשנות את חוקי המשחק בשוק היד-שנייה.
                        אנחנו מאמינים שעסקה טובה היא עסקה שבה שני הצדדים ישנים בשקט.
                        הטכנולוגיה שלנו מחליפה את החשש באמון, ואת הבירוקרטיה בחוויה בלחיצת כפתור.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 mt-16 text-right">
                        <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-2xl font-bold mb-4 text-primary">כוח הקנייה הקבוצתי</h3>
                            <p className="text-muted-foreground">הקהילה שלנו היא הכוח שלכם. אנחנו מאגדים אלפי משתמשים כדי להשיג <strong className="text-foreground">מחירי משלוח שוברי שוק</strong> והטבות בלעדיות ששמורות רק לחברות ענק.</p>
                        </div>
                        <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-2xl font-bold mb-4 text-primary">שקיפות מלאה</h3>
                            <p className="text-muted-foreground">בלי אותיות קטנות ובלי הפתעות. כל שלב בעסקה מתועד, והכסף שלכם מוגן בנאמנות עד לרגע האישור הסופי.</p>
                        </div>
                        <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-2xl font-bold mb-4 text-primary">חוויה מנצחת</h3>
                            <p className="text-muted-foreground">אנחנו הופכים את &quot;הכאב ראש&quot; של יד-2 למשחק ילדים. הכל אוטומטי, הכל מהיר, והכל מהנייד.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Member Benefits / Gamification Teaser (New) */}
            <section className="py-24 bg-gradient-to-b from-black to-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                <div className="container px-4 relative z-10">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold tracking-wide text-sm">
                                <span>👑</span>
                                <span>מועדון ה-PRO</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                משחקים, צוברים <br />
                                <span className="text-yellow-400">ומרוויחים בגדול!</span>
                            </h2>
                            <p className="text-lg text-slate-300 leading-relaxed">
                                ב-Qlikndeal, נאמנות שווה כסף. ככל שתבצעו יותר עסקאות מוצלחות, תצברו נקודות ותעלו בדרגות האמינות.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "✨ צבירת נקודות על כל קנייה או מכירה",
                                    "🛡️ תג 'מוכר מאומת' שמקפיץ את המודעות שלכם",
                                    "🎁 המרת נקודות למשלוחים חינם והטבות",
                                    "🏆 תחרויות חודשיות עם פרסים שווים"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-lg">
                                        <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_10px_orange]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <Button className="h-14 px-8 text-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] mt-4">
                                הצטרפו למהפכה בחינם
                            </Button>
                        </div>

                        <div className="relative">
                            {/* Abstract 'Level Up' Visual */}
                            <div className="relative aspect-square bg-gradient-to-tr from-yellow-500/20 to-purple-500/20 rounded-3xl border border-white/10 backdrop-blur-3xl overflow-hidden flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="text-6xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">LVL 5</div>
                                    <div className="text-2xl font-bold text-white">הילה של אמון</div>
                                    <div className="flex gap-2 justify-center">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <span key={i} className="text-yellow-400 text-2xl">★</span>
                                        ))}
                                    </div>
                                    <div className="w-64 h-3 bg-white/10 rounded-full mx-auto overflow-hidden mt-4">
                                        <div className="h-full w-[85%] bg-yellow-500 shadow-[0_0_15px_orange]" />
                                    </div>
                                    <div className="text-sm text-slate-400 mt-2">המרחק שלך להטבה הבאה: 15%</div>
                                </div>
                            </div>

                            {/* Floating decorative elements */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/30 rounded-full blur-2xl animate-pulse" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-700" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Comparison Table */}
            <section className="py-24 bg-muted/20 border-t border-border/50">
                <div className="container px-4 max-w-6xl">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent font-['Outfit']">למה לבחור ב-Qlik<span className="text-primary font-light">n</span>deal?</h2>

                    <div className="bg-card/40 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-12 md:divide-x md:divide-x-reverse divide-white/5">

                            {/* Labels Column (Middle on Desktop for balance, or side?) - Let's do Side (3 cols: 3, 4.5, 4.5) */}
                            <div className="hidden md:flex md:col-span-2 flex-col bg-muted/30">
                                <div className="h-20 border-b border-white/5"></div> {/* Spacer */}
                                <div className="p-6 font-bold text-lg flex items-center justify-center h-28 border-b border-white/5">בדיקת המוצר</div>
                                <div className="p-6 font-bold text-lg flex items-center justify-center h-28 border-b border-white/5">ביטחון לכסף</div>
                                <div className="p-6 font-bold text-lg flex items-center justify-center h-28 border-b border-white/5">אמינות המוכר</div>
                                <div className="p-6 font-bold text-lg flex items-center justify-center h-28 border-b border-white/5">תשלום</div>
                                <div className="p-6 font-bold text-lg flex items-center justify-center h-28">נוחות</div>
                            </div>

                            {/* "Old Way" Column */}
                            <div className="md:col-span-5 flex flex-col relative group">
                                <div className="h-20 flex items-center justify-center bg-red-500/10 text-red-400 font-black text-2xl border-b border-white/5 tracking-wide">
                                    המצב כיום ❌
                                </div>

                                <div className="p-8 flex flex-col justify-center h-auto md:h-28 text-center text-muted-foreground hover:bg-white/5 transition-colors border-b border-white/5">
                                    <span className="md:hidden font-bold text-white mb-2 text-lg">בדיקת המוצר:</span>
                                    לחץ ברחוב, בחושך או בבית זר. <br />אין באמת דרך לבדוק.
                                </div>
                                <div className="p-8 flex flex-col justify-center h-auto md:h-28 text-center text-muted-foreground bg-white/5 md:bg-transparent md:group-hover:bg-white/5 transition-colors border-b border-white/5">
                                    <span className="md:hidden font-bold text-white mb-2 text-lg">ביטחון לכסף:</span>
                                    העברת בביט/מזומן? <br />אם רמו אותך, הכסף הלך.
                                </div>
                                <div className="p-8 flex flex-col justify-center h-auto md:h-28 text-center text-muted-foreground hover:bg-white/5 transition-colors border-b border-white/5">
                                    <span className="md:hidden font-bold text-white mb-2 text-lg">אמינות המוכר:</span>
                                    המוצר פגום? הפסדת את הנסיעה ואת הזמן. <br />שום פיצוי.
                                </div>
                                <div className="p-8 flex flex-col justify-center h-auto md:h-28 text-center text-muted-foreground bg-white/5 md:bg-transparent md:group-hover:bg-white/5 transition-colors border-b border-white/5">
                                    <span className="md:hidden font-bold text-white mb-2 text-lg">תשלום:</span>
                                    הכל במכה אחת (מזומן/העברה). <br />כבד על הכיס.
                                </div>
                                <div className="p-8 flex flex-col justify-center h-auto md:h-28 text-center text-muted-foreground hover:bg-white/5 transition-colors">
                                    <span className="md:hidden font-bold text-white mb-2 text-lg">נוחות:</span>
                                    תיאומים מעייפים, פקקים, דלק, <br />בזבוז זמן יקר.
                                </div>
                            </div>

                            {/* "Qlikndeal Way" Column */}
                            <div className="md:col-span-5 flex flex-col relative bg-gradient-to-b from-primary/5 to-transparent">
                                <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10" />
                                <div className="h-20 flex items-center justify-center bg-primary/20 text-primary font-black text-2xl border-b border-primary/20 shadow-[0_0_30px_rgba(34,211,238,0.15)] tracking-wide">
                                    עם Qlikndeal ✅
                                </div>

                                <div className="p-8 flex flex-col justify-center h-auto md:h-28 text-center font-medium text-white hover:bg-primary/10 transition-colors border-b border-primary/10 relative overflow-hidden">
                                    <span className="md:hidden font-bold text-primary mb-2 text-lg">בדיקת המוצר:</span>
                                    <span className="text-lg">24 שעות של בדיקה שקטה ורגועה אצלך בבית.</span>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_var(--primary)]" />
                                </div>
                                <div className="p-8 flex flex-col justify-center h-auto md:h-28 text-center font-medium text-white bg-primary/5 md:bg-transparent md:hover:bg-primary/10 transition-colors border-b border-primary/10 relative overflow-hidden">
                                    <span className="md:hidden font-bold text-primary mb-2 text-lg">ביטחון לכסף:</span>
                                    <span className="text-lg">כסף בנאמנות. המוכר מקבל תשלום רק אחרי שאישרתם.</span>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_var(--primary)]" />
                                </div>
                                <div className="p-8 flex flex-col justify-center h-auto md:h-28 text-center font-medium text-white hover:bg-primary/10 transition-colors border-b border-primary/10 relative overflow-hidden">
                                    <span className="md:hidden font-bold text-primary mb-2 text-lg">אמינות המוכר:</span>
                                    <span className="text-lg">המוכר מתחייב. שיקר? הוא משלם את המשלוח.</span>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_var(--primary)]" />
                                </div>
                                <div className="p-8 flex flex-col justify-center h-auto md:h-28 text-center font-medium text-white bg-primary/5 md:bg-transparent md:hover:bg-primary/10 transition-colors border-b border-primary/10 relative overflow-hidden">
                                    <span className="md:hidden font-bold text-primary mb-2 text-lg">תשלום:</span>
                                    <span className="text-lg font-bold text-primary">כרטיס אשראי עד 12 תשלומים!</span>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_var(--primary)]" />
                                </div>
                                <div className="p-8 flex flex-col justify-center h-auto md:h-28 text-center font-medium text-white hover:bg-primary/10 transition-colors relative overflow-hidden">
                                    <span className="md:hidden font-bold text-primary mb-2 text-lg">נוחות:</span>
                                    <span className="text-lg">לחיצת כפתור מהספה. השליח כבר בדרך.</span>
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_var(--primary)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Steps */}
            <section className="py-20 bg-background border-t border-border/50">
                <div className="container px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד?</h2>
                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2" />

                        {[
                            { step: 1, title: "מוצאים וסוגרים", desc: "מצאתם מציאה בפייסבוק או ביד-2? סכמו מחיר וצרו לינק בטוח." },
                            { step: 2, title: "בדיקת AI ותשלום", desc: "המערכת בודקת את תמונות המוצר. התשלום מוחזק בנאמנות." },
                            { step: 3, title: "משלוח מהיר", desc: "שליח אוסף את החבילה ומעביר אותה לקונה." },
                            { step: 4, title: "בדיקה ושחרור", desc: "לקונה יש 24 שעות לבדוק את המוצר לפני שחרור הכסף." }
                        ].map((item) => (
                            <div key={item.step} className="flex flex-col items-center text-center bg-background p-4">
                                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4 shadow-lg ring-4 ring-background">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-muted/30 border-t border-border/50">
                <div className="container px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-card border border-border/50">
                            <Shield className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-bold mb-2">נאמנות 24 שעות</h3>
                            <p className="text-muted-foreground">הכסף משוחרר למוכר רק אחרי שקיבלת את המוצר, בדקת אותו במשך יממה ואישרת שהכל תקין.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-card border border-border/50">
                            <Truck className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-bold mb-2">משלוח חברתי</h3>
                            <p className="text-muted-foreground">אנחנו מאגדים אלפי משלוחים יחד כדי להשיג לכם את המחירים הטובים ביותר מול חברות השילוח.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-card border border-border/50">
                            <Package className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-bold mb-2">פריסת תשלומים</h3>
                            <p className="text-muted-foreground">הקונה יכול לשלם בכרטיס אשראי עד 12 תשלומים נוחים, והמוכר מקבל את הכסף כרגיל.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-background border-t border-border/50">
                <div className="container px-4 max-w-4xl text-center">
                    <h2 className="text-3xl font-bold mb-4">שאלות נפוצות</h2>
                    <p className="text-muted-foreground mb-12">כל מה שרציתם לדעת על קנייה ומכירה בטוחה</p>

                    <div className="space-y-4 text-right">
                        {[
                            {
                                q: "למה אני באמת צריך את השירות שלכם?",
                                a: "אנחנו הפתרון לכאב הראש של קנייה מיד שנייה. במקום לבזבז זמן בדרכים, להסתכן ברמאויות או לקנות 'חתול בשק', אנחנו דואגים לכל השרשרת: בודקים את המוכר, מאבטחים את הכסף שלכם, דואגים למשלוח מהיר ומאפשרים לכם לבדוק את המוצר בנחת בבית. זה לא רק שירות משלוחים, זה שקט נפשי."
                            },
                            {
                                q: "כמה עולה המשלוח?",
                                a: "אנחנו מפעילים 'משלוחים חברתיים' – בזכות כוח הקנייה המשותף של אלפי המשתמשים שלנו, אנחנו משיגים מחירים קבוצתיים שוברי שוק מול חברות השליחויות הגדולות, ומעבירים את ההנחה הזו ישירות אליכם."
                            },
                            {
                                q: "האם כל אחד יכול להשתמש בשירות?",
                                a: "בהחלט! השירות פתוח לכולם - בין אם אתם אנשים פרטיים שמוכרים ספה, בעלי עסק ששולחים מוצרים ללקוחות, או סתם מעבירים חבילה למשפחה."
                            },
                            {
                                q: "האם יש יתרון למי ששולח הרבה?",
                                a: "כן. האלגוריתם שלנו מזהה לקוחות חוזרים וכבדים, ומתאים להם מחירון VIP מיוחד אוטומטית. ככל שתשלחו יותר, תשלמו פחות."
                            },
                            {
                                q: "למה כדאי לי להירשם עם פרטים מלאים?",
                                a: "הרשמה מלאה הופכת אתכם ל'חברי מועדון'. זה נותן לכם גישה להטבות בלעדיות, מעקב משלוחים מתקדם, היסטוריית עסקאות מסודרת וצבירת נקודות לשימוש עתידי."
                            },
                            {
                                q: "מה זה 'חבר מביא חבר'?",
                                a: "פשוט מאוד: שלחו לינק לחבר. אם הוא יבצע משלוח דרכנו, אתם תקבלו מיידית זיכוי למשלוח חינם לכל יעד בארץ. שווה לשתף!"
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-colors text-right">
                                <details className="group">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6">
                                        <span className="font-bold text-lg text-foreground/90">{item.q}</span>
                                        <span className="transition-transform duration-300 group-open:rotate-180 p-1 bg-primary/10 rounded-full text-primary">
                                            <svg fill="none" height="20" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M6 9l6 6 6-6"></path></svg>
                                        </span>
                                    </summary>
                                    <div className="text-muted-foreground p-6 pt-0 leading-relaxed bg-muted/10 animate-in slide-in-from-top-2 duration-200">
                                        {item.a}
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
