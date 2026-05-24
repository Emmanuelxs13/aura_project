export default function Nosotros() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-primary-dark py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Sobre Aura Store</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tecnologia premium para quienes exigen lo mejor. Desde 2024, llevando innovacion y calidad a nuestros clientes.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Nuestra Historia</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Aura Store nacio de la pasion por la tecnologia y el deseo de ofrecer una experiencia de compra
                  diferente. Fundada en 2024 por un equipo de emprendedores colombianos, nuestra mision es hacer
                  accesible lo mejor de la tecnologia premium.
                </p>
                <p>
                  Trabajamos directamente con distribuidores autorizados para garantizar que cada producto que
                  vendes sea 100% original, sellado de fabrica y con garantia oficial.
                </p>
                <p>
                  Hoy somos una referencia en el mercado colombiano de tecnologia, con clientes en todo el pais
                  y un compromiso inquebrantable con la calidad y el servicio.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-secondary/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Nuestros Valores</h3>
              <div className="space-y-6">
                {[
                  { title: 'Calidad', desc: 'Solo productos originales y de las mejores marcas.' },
                  { title: 'Confianza', desc: 'Transparencia en cada compra con garantia y soporte.' },
                  { title: 'Innovacion', desc: 'Siempre a la vanguardia de la tecnologia.' },
                  { title: 'Servicio', desc: 'Atencion personalizada y soporte post-venta.' },
                ].map(v => (
                  <div key={v.title} className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{v.title}</h4>
                      <p className="text-sm text-gray-500">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Nuestro Equipo</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">Conoce a las personas detras de Aura Store</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Esteban Correa', role: 'CEO & Fundador', desc: 'Visionario tecnologico con experiencia en e-commerce y desarrollo de negocio.' },
              { name: 'Emmanuel Berrio', role: 'CTO', desc: 'Arquitecto de software especializado en sistemas escalables y experiencia de usuario.' },
              { name: 'Andres ...', role: 'COO', desc: 'Operaciones y logistica. Asegura que cada pedido llegue a tiempo y en perfectas condiciones.' },
            ].map(member => (
              <div key={member.name} className="text-center p-8 card">
                <div className="w-24 h-24 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                <p className="text-sm text-accent font-medium mb-3">{member.role}</p>
                <p className="text-sm text-gray-500">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
