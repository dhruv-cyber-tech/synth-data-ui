import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: {
    category_id: number;
    name: string;
    description: string | null;
    icon_url: string | null;
  };
  promptCount?: number;
  index?: number;
}

const CategoryCard = ({ category, promptCount = 0, index = 0 }: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/prompts?category=${category.category_id}`}>
        <div className="group rounded-xl border border-border bg-card/30 p-6 hover:border-accent/30 transition-all duration-300 hover:glow-purple text-center">
          <div className="text-4xl mb-4">{category.icon_url || "📁"}</div>
          <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">
            {promptCount} prompts
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
