import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

const UploadCrop = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    disease: string;
    confidence: number;
    severity: "low" | "medium" | "high";
    treatment: string[];
    prevention: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setResult({
      disease: "Bacterial Leaf Blight",
      confidence: 94,
      severity: "medium",
      treatment: [
        "Apply copper-based bactericide (2g/L water)",
        "Remove and destroy infected leaves",
        "Ensure proper drainage in the field",
        "Spray Streptomycin sulfate (0.5g/L) if severe",
      ],
      prevention: [
        "Use disease-resistant varieties",
        "Avoid excessive nitrogen fertilization",
        "Maintain proper plant spacing",
        "Practice crop rotation",
      ],
    });
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-success/10 text-success";
      case "medium":
        return "bg-warning/10 text-warning";
      case "high":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <PageLayout>
      <div className="container-app py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Camera className="h-4 w-4" />
            AI Disease Detection
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Upload Crop Image
          </h1>
          <p className="text-lg text-muted-foreground">
            Take a clear photo of the affected plant part. Our AI will identify
            the disease and suggest treatments.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Upload Area */}
          <Card className="mb-6">
            <CardContent className="p-5">
              {!image ? (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-2">
                    Click to upload or drag & drop
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    PNG, JPG up to 10MB
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="secondary" size="sm">
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                      Browse Files
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={image}
                    alt="Uploaded crop"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImage(null);
                      setResult(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Analyze Button */}
          {image && !result && (
            <Button
              className="w-full mb-6"
              size="lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  Analyze Crop
                </>
              )}
            </Button>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4 animate-fade-in">
              {/* Disease Card */}
              <Card className="border-warning/30">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-6 w-6 text-warning" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold text-foreground text-xl">
                          {result.disease}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                            result.severity
                          )}`}
                        >
                          {result.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {result.confidence}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Card */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Recommended Treatment
                  </h3>
                  <ul className="space-y-3">
                    {result.treatment.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-foreground"
                      >
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Prevention Card */}
              <Card className="bg-muted/30">
                <CardContent className="p-5">
                  <h3 className="font-heading font-bold text-foreground mb-4">
                    Prevention Tips
                  </h3>
                  <ul className="space-y-2">
                    {result.prevention.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setImage(null);
                    setResult(null);
                  }}
                >
                  Scan Another
                </Button>
                <Button className="flex-1">Save Report</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default UploadCrop;
