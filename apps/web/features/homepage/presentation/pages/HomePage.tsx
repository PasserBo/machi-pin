import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ReactCompareSlider } from 'react-compare-slider';
import { useAuth } from '@/features/authorization/presentation/components/AuthContext';
import TopNavBar, { TOP_NAV_BAR_HEIGHT } from '@/components/TopNavBar';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <>
      <Head>
        <title>Machi-Pin - 将地图的控制权还给你</title>
        <meta name="description" content="拒绝被算法信息流裹挟。像真实的软木板一样划定边界，像真实的拍立得一样不可涂改。用图钉作标，以相纸为记。" />
      </Head>

      <div className="min-h-screen bg-[#faf8f5]">
        <TopNavBar />

        {/* ——— 第一板块：Hero ——— */}
        <section
          className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row lg:items-center lg:min-h-[calc(100vh-5rem)] gap-12 lg:gap-16"
          style={{ paddingTop: TOP_NAV_BAR_HEIGHT + 48, paddingBottom: 80 }}
        >
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              将地图的控制权还给你
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-10 max-w-xl">
              拒绝被算法信息流裹挟，像真实的软木板一样划定边界，像真实的拍立得一样不可涂改。用图钉作标，以相纸为记。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-black text-white rounded-full text-lg font-semibold hover:bg-gray-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                免费开启我的地图
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-gray-400 text-gray-800 rounded-full text-lg font-semibold hover:border-gray-600 hover:bg-gray-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
              >
                Login
              </Link>
            </div>
          </div>
          {/* Mock: 拍立得 + 红图钉 + 干净地图，渐白 */}
          <div className="flex-1 relative flex justify-center items-center min-h-[320px] lg:min-h-[420px]">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-stone-100 to-white shadow-2xl">
              {/* 地图肌理：淡淡街道网格 */}
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(to right, #d4d0c8 1px, transparent 1px), linear-gradient(to bottom, #d4d0c8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="absolute inset-0 bg-gradient-to-t to-r from-white/90 via-transparent to-white/70" />
              {/* 拍立得 mock：白卡微微翘起 */}
              <div
                className="absolute w-44 h-52 bg-white rounded-sm shadow-xl border border-gray-200/80"
                style={{ transform: 'rotate(-6deg) translate(10%, -5%)', top: '35%', left: '28%' }}
              >
                <div className="absolute inset-2 bg-gray-100 rounded-sm" />
                <div className="absolute bottom-3 left-0 right-0 h-3 bg-white" />
              </div>
              {/* 红图钉 */}
              <div
                className="absolute w-6 h-6 rounded-full bg-red-500 shadow-lg border-2 border-red-600"
                style={{ top: '42%', left: '38%', transform: 'translate(-50%, -50%) rotate(-6deg)' }}
              />
              <div className="absolute w-2 h-4 bg-red-600 rounded-full" style={{ top: '46%', left: '38%', transform: 'translate(-50%, 0) rotate(-6deg)' }} />
              {/* 边缘渐白 */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-white pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ——— 第二板块：痛点对比 (The Contrast) ——— */}
        <section className="py-24 bg-[#faf8f5]">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-center text-stone-500 mb-12 text-xl sm:text-2xl">
              屏蔽算法的数据，记录自己的足迹。
            </p>
            <div className="h-[400px] md:h-[600px] rounded-[2rem] shadow-2xl overflow-hidden bg-stone-200">
              <ReactCompareSlider
                itemOne={
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 text-white text-center px-6">
                    <span className="text-lg sm:text-xl font-medium">
                      [占位图：嘈杂、拥挤的现代地图截图]
                    </span>
                  </div>
                }
                itemTwo={
                  <div className="h-full w-full flex items-center justify-center bg-[#F5F5DC] text-stone-600 text-center px-6">
                    <span className="text-lg sm:text-xl font-medium">
                      [占位图：极简的 Machi-Pin 地图截图]
                    </span>
                  </div>
                }
                className="h-full w-full"
                style={{ minHeight: 0 }}
              />
            </div>
          </div>
        </section>

        {/* ——— 第五板块：FAQ ——— */}
        <section className="max-w-3xl mx-auto px-6 py-20 sm:py-28">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">常见问题</h2>
          <dl className="space-y-8">
            <div>
              <dt className="text-lg font-semibold text-gray-900 mb-2">为什么我不能编辑写好的拍立得？</dt>
              <dd className="text-gray-600 leading-relaxed">
                因为真实的墨水干了就不能擦除。我们希望你每一次记录都更加慎重和真实。
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900 mb-2">为什么地图上搜不到我想去的店？</dt>
              <dd className="text-gray-600 leading-relaxed">
                Machi-Pin 不是导航工具。它是一张空白画布，等待你去探索，而不是被推荐算法带路。
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900 mb-2">我可以分享给所有人看吗？</dt>
              <dd className="text-gray-600 leading-relaxed">
                目前，这只是你的私人手帐。这片宁静暂时只属于你。（未来的社交/分享功能将取决于 Beta 测试反馈。）
              </dd>
            </div>
          </dl>
        </section>

        {/* ——— 第六板块：Final CTA + Footer ——— */}
        <section className="bg-gray-900 text-white py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-xl sm:text-2xl text-gray-200 mb-10 leading-relaxed">
              准备好建立你的第一张地图了吗？加入 Beta 测试，开始慢节奏的记录。
            </p>
            <Link
              href="/login"
              className="inline-block px-12 py-5 bg-white text-gray-900 rounded-full text-xl font-semibold hover:bg-gray-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              立刻开始记录
            </Link>
          </div>
        </section>

        <footer className="border-t border-gray-200 bg-[#faf8f5] py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
              📍 Machi-Pin
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">开发者日志</a>
              <a href="#" className="hover:text-gray-900">关于理念</a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            © 2025 Machi-Pin. 保留一切权利。
          </div>
        </footer>
      </div>
    </>
  );
}
