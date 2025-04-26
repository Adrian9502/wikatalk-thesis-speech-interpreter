// FAQ Categories
interface Category {
  id: string;

  title: string;
}

const categories: Category[] = [
  { id: "general", title: "General Information" },
  { id: "features", title: "Features & Usage" },
  { id: "translation", title: "Translation Capabilities" },
  { id: "account", title: "Account & Settings" },
  { id: "troubleshooting", title: "Troubleshooting" },
  { id: "limitations", title: "Known Limitations" },
];

export default categories;
