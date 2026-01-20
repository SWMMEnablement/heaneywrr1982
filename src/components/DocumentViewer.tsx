import { motion } from "framer-motion";
import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DocumentViewer = () => {
  const pdfUrl = "/documents/game-theory-paper.pdf";

  return (
    <section id="document" className="py-20 px-6 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Original Document
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            Research Paper PDF
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Access the complete original paper from Water Resources Research, June 1982
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button 
              asChild
              className="bg-primary hover:bg-primary/90"
            >
              <a href={pdfUrl} download="Heaney-Dickinson-1982-Cost-Apportionment.pdf">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </Button>
            <Button 
              variant="outline"
              asChild
            >
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="card-elevated overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-interactive/5 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif">
                    Methods for Apportioning the Cost of a Water Resource Project
                  </CardTitle>
                  <CardDescription className="mt-2">
                    James P. Heaney & Robert E. Dickinson • University of Florida • 1982
                  </CardDescription>
                </div>
                <FileText className="w-10 h-10 text-primary/30" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full" style={{ height: "80vh", minHeight: "600px" }}>
                <iframe
                  src={pdfUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Research Paper PDF"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Paper Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="card-elevated">
            <CardContent className="py-6">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Journal</div>
                  <div className="font-semibold">Water Resources Research</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Volume & Issue</div>
                  <div className="font-semibold">Vol. 18, No. 3</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Pages</div>
                  <div className="font-semibold">476-482</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Published</div>
                  <div className="font-semibold">June 1982</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default DocumentViewer;
