import { Leaf, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-primary mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-h4">KisanMitra</span>
            </Link>
            <p className="text-body-sm text-muted-foreground">
              AI-powered farming assistant helping farmers make better decisions with smart technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-h4 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Dashboard", "Ask Question", "Upload Crop Image", "Mandi Prices"].map((link) => (
                <li key={link}>
                  <Link 
                    to={`/${link.toLowerCase().replace(/ /g, "-")}`}
                    className="text-body-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading text-h4 mb-4">Resources</h4>
            <ul className="space-y-2">
              {["Farming Tips", "Disease Guide", "Soil Health", "Weather Alerts"].map((link) => (
                <li key={link}>
                  <Link 
                    to="#"
                    className="text-body-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-h4 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                1800-XXX-XXXX (Toll Free)
              </li>
              <li className="flex items-center gap-2 text-body-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                help@kisanmitra.in
              </li>
              <li className="flex items-start gap-2 text-body-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                Agricultural Research Center, New Delhi
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-caption text-muted-foreground">
            © 2024 KisanMitra. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-caption text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-caption text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
