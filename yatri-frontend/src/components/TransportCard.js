import { motion } from "framer-motion";
import { ArrowRight, Bus, CarTaxiFront, TrainFront, MapPin, Clock, Star } from "lucide-react";

const iconMap = {
  bus: Bus,
  train: TrainFront,
  cab: CarTaxiFront,
};

const imageUrls = {
  bus: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
  train: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80",
  cab: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
};

const imageGradient = {
  bus: "from-blue-500/20 to-purple-500/20",
  train: "from-emerald-500/20 to-teal-500/20",
  cab: "from-orange-500/20 to-red-500/20",
};

const routeExamples = {
  bus: "Delhi → Mumbai",
  train: "Chennai → Bangalore",
  cab: "Pune → Mumbai",
};

function TransportCard({ item, theme, onSelect }) {
  const Icon = iconMap[item.type] || Bus;
  const isLight = theme === "light";

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative overflow-hidden rounded-[28px] border transition-all duration-300 ${
        isLight
          ? "border-neutral-900/8 bg-white/75 shadow-lg hover:shadow-xl"
          : "border-white/10 bg-white/5 shadow-lg hover:shadow-xl"
      }`}
    >
      {/* Image Background Section */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={imageUrls[item.type]} 
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 right-4">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
            isLight ? "bg-white/90 text-[#E65100]" : "bg-black/40 text-[#FFB066]"
          }`}>
            {item.accent}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className={`font-display text-2xl font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
          {item.title}
        </h3>
        
        {/* Route Example */}
        <div className="mt-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#FF9933]" />
          <p className={`text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>
            {routeExamples[item.type]}
          </p>
        </div>

        {/* Features */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { icon: Clock, text: "Fast Booking" },
            { icon: Star, text: "Top Rated" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                isLight
                  ? "bg-neutral-900/6 text-neutral-600"
                  : "bg-white/8 text-white/55"
              }`}
            >
              <feature.icon className="h-3 w-3 text-[#FF9933]" />
              {feature.text}
            </div>
          ))}
        </div>

        <p className={`mt-4 text-sm leading-6 ${isLight ? "text-neutral-600" : "text-white/60"}`}>
          {item.description}
        </p>

        <button
          type="button"
          onClick={() => onSelect(item.type)}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl saffron-gradient px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:scale-[1.02] shadow-md"
        >
          Book {item.title}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default TransportCard;
