import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, TrendingUp, TrendingDown, IndianRupee, MapPin } from "lucide-react";

const mandiData = [
  {
    crop: "Wheat",
    variety: "Sharbati",
    price: 2150,
    change: 2.3,
    mandi: "Indore",
    state: "MP",
    minPrice: 2050,
    maxPrice: 2250,
  },
  {
    crop: "Rice",
    variety: "Basmati 1121",
    price: 3400,
    change: 1.1,
    mandi: "Karnal",
    state: "Haryana",
    minPrice: 3200,
    maxPrice: 3600,
  },
  {
    crop: "Cotton",
    variety: "Medium Staple",
    price: 6200,
    change: -0.5,
    mandi: "Rajkot",
    state: "Gujarat",
    minPrice: 6000,
    maxPrice: 6400,
  },
  {
    crop: "Soybean",
    variety: "Yellow",
    price: 4800,
    change: 3.2,
    mandi: "Ujjain",
    state: "MP",
    minPrice: 4600,
    maxPrice: 5000,
  },
  {
    crop: "Maize",
    variety: "Yellow",
    price: 1850,
    change: -1.2,
    mandi: "Davangere",
    state: "Karnataka",
    minPrice: 1750,
    maxPrice: 1950,
  },
  {
    crop: "Groundnut",
    variety: "Bold",
    price: 5400,
    change: 2.8,
    mandi: "Junagadh",
    state: "Gujarat",
    minPrice: 5200,
    maxPrice: 5600,
  },
  {
    crop: "Mustard",
    variety: "Yellow",
    price: 4900,
    change: 0.8,
    mandi: "Alwar",
    state: "Rajasthan",
    minPrice: 4700,
    maxPrice: 5100,
  },
  {
    crop: "Chana",
    variety: "Desi",
    price: 5100,
    change: -0.3,
    mandi: "Jaipur",
    state: "Rajasthan",
    minPrice: 4900,
    maxPrice: 5300,
  },
];

const MandiPrices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");

  const states = ["all", ...new Set(mandiData.map((item) => item.state))];

  const filteredData = mandiData.filter((item) => {
    const matchesSearch =
      item.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mandi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState =
      selectedState === "all" || item.state === selectedState;
    return matchesSearch && matchesState;
  });

  return (
    <PageLayout>
      <div className="container-app py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <IndianRupee className="h-4 w-4" />
            Live Market Prices
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Mandi Prices
          </h1>
          <p className="text-lg text-muted-foreground">
            Check today's crop prices across major mandis. Updated every 30
            minutes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search crop or mandi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {states.map((state) => (
              <Button
                key={state}
                variant={selectedState === state ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedState(state)}
              >
                {state === "all" ? "All States" : state}
              </Button>
            ))}
          </div>
        </div>

        {/* Price Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item, index) => (
            <Card
              key={`${item.crop}-${item.mandi}`}
              className="animate-fade-in hover:shadow-strong transition-shadow"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-foreground">
                      {item.crop}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.variety}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                      item.change >= 0
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {item.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {item.change >= 0 ? "+" : ""}
                    {item.change}%
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-foreground flex items-center">
                    <IndianRupee className="h-6 w-6" />
                    {item.price.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      /qtl
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Range: ₹{item.minPrice.toLocaleString()} - ₹
                    {item.maxPrice.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {item.mandi}, {item.state}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No results found. Try a different search term.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MandiPrices;
