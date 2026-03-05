import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CodeSnippetGenerator({ entity, operation, requestBody }) {
  const [language, setLanguage] = useState("javascript");
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    const bodyStr = requestBody ? JSON.stringify(requestBody, null, 2) : '{}';
    
    const snippets = {
      javascript: {
        list: `// Using CloudFlip SDK (fetch style)
import { api } from '@/api/apiClient';

const ${entity.toLowerCase()}s = await api.entities.${entity}.list();
console.log(${entity.toLowerCase()}s);

// Using axios
import axios from 'axios';

const response = await axios.get('/api/apps/{app_id}/entities/${entity}', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
});
console.log(response.data);`,

        create: `// Using CloudFlip SDK
import { api } from '@/api/apiClient';

const data = ${bodyStr};
const new${entity} = await api.entities.${entity}.create(data);
console.log('Created:', new${entity});

// Using axios
import axios from 'axios';

const response = await axios.post('/api/apps/{app_id}/entities/${entity}', data, {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN', 'Content-Type': 'application/json' }
});
console.log('Created:', response.data);`,

        filter: `// Using CloudFlip SDK
import { api } from '@/api/apiClient';

const filters = ${bodyStr};
const filtered${entity}s = await api.entities.${entity}.filter(filters);
console.log('Found:', filtered${entity}s.length);`,

        schema: `// Using CloudFlip SDK
import { api } from '@/api/apiClient';

const schema = await api.entities.${entity}.schema();
console.log(schema);`
      },

      python: {
        list: `# Using requests library
import requests

response = requests.get(
    'https://api.cloudflip.com/v1/entities/${entity}',
    headers={'Authorization': 'Bearer YOUR_TOKEN'}
)
${entity.toLowerCase()}s = response.json()
print(${entity.toLowerCase()}s)`,

        create: `# Using requests library
import requests

data = ${bodyStr}

response = requests.post(
    'https://api.cloudflip.com/v1/entities/${entity}',
    json=data,
    headers={'Authorization': 'Bearer YOUR_TOKEN', 'Content-Type': 'application/json'}
)
new_${entity.toLowerCase()} = response.json()
print(f'Created: {new_${entity.toLowerCase()}}')`,

        filter: `# Using requests library
import requests

filters = ${bodyStr}

response = requests.post(
    'https://api.cloudflip.com/v1/entities/${entity}/filter',
    json=filters,
    headers={'Authorization': 'Bearer YOUR_TOKEN', 'Content-Type': 'application/json'}
)
filtered_${entity.toLowerCase()}s = response.json()
print(f'Found: {len(filtered_${entity.toLowerCase()}s)}')`,

        schema: `# Using requests library
import requests

response = requests.get(
    'https://api.cloudflip.com/v1/entities/${entity}/schema',
    headers={'Authorization': 'Bearer YOUR_TOKEN'}
)
schema = response.json()
print(schema)`
      },

      java: {
        list: `// Using OkHttp
OkHttpClient client = new OkHttpClient();

Request request = new Request.Builder()
    .url("https://api.cloudflip.com/v1/entities/${entity}")
    .addHeader("Authorization", "Bearer YOUR_TOKEN")
    .build();

Response response = client.newCall(request).execute();
String ${entity.toLowerCase()}s = response.body().string();
System.out.println(${entity.toLowerCase()}s);`,

        create: `// Using OkHttp
OkHttpClient client = new OkHttpClient();
MediaType JSON = MediaType.parse("application/json");

String json = "${bodyStr.replace(/"/g, '\\"').replace(/\n/g, '')}";
RequestBody body = RequestBody.create(json, JSON);

Request request = new Request.Builder()
    .url("https://api.cloudflip.com/v1/entities/${entity}")
    .addHeader("Authorization", "Bearer YOUR_TOKEN")
    .post(body)
    .build();

Response response = client.newCall(request).execute();
String new${entity} = response.body().string();
System.out.println("Created: " + new${entity});`,

        filter: `// Using OkHttp
OkHttpClient client = new OkHttpClient();
MediaType JSON = MediaType.parse("application/json");

String filters = "${bodyStr.replace(/"/g, '\\"').replace(/\n/g, '')}";
RequestBody body = RequestBody.create(filters, JSON);

Request request = new Request.Builder()
    .url("https://api.cloudflip.com/v1/entities/${entity}/filter")
    .addHeader("Authorization", "Bearer YOUR_TOKEN")
    .post(body)
    .build();

Response response = client.newCall(request).execute();
System.out.println(response.body().string());`,

        schema: `// Using OkHttp
OkHttpClient client = new OkHttpClient();

Request request = new Request.Builder()
    .url("https://api.cloudflip.com/v1/entities/${entity}/schema")
    .addHeader("Authorization", "Bearer YOUR_TOKEN")
    .build();

Response response = client.newCall(request).execute();
System.out.println(response.body().string());`
      },

      csharp: {
        list: `// Using HttpClient
using System.Net.Http;
using System.Net.Http.Headers;

var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", "YOUR_TOKEN");

var response = await client.GetAsync(
    "https://api.cloudflip.com/v1/entities/${entity}"
);
var ${entity.toLowerCase()}s = await response.Content.ReadAsStringAsync();
Console.WriteLine(${entity.toLowerCase()}s);`,

        create: `// Using HttpClient
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", "YOUR_TOKEN");

var json = "${bodyStr.replace(/"/g, '\\"').replace(/\n/g, '')}";
var content = new StringContent(json, Encoding.UTF8, "application/json");

var response = await client.PostAsync(
    "https://api.cloudflip.com/v1/entities/${entity}",
    content
);
var new${entity} = await response.Content.ReadAsStringAsync();
Console.WriteLine($"Created: {new${entity}}");`,

        filter: `// Using HttpClient
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", "YOUR_TOKEN");

var filters = "${bodyStr.replace(/"/g, '\\"').replace(/\n/g, '')}";
var content = new StringContent(filters, Encoding.UTF8, "application/json");

var response = await client.PostAsync(
    "https://api.cloudflip.com/v1/entities/${entity}/filter",
    content
);
Console.WriteLine(await response.Content.ReadAsStringAsync());`,

        schema: `// Using HttpClient
using System.Net.Http;
using System.Net.Http.Headers;

var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", "YOUR_TOKEN");

var response = await client.GetAsync(
    "https://api.cloudflip.com/v1/entities/${entity}/schema"
);
Console.WriteLine(await response.Content.ReadAsStringAsync());`
      },

      curl: {
        list: `# List ${entity} using cURL
curl -X GET "https://api.cloudflip.com/v1/entities/${entity}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`,

        create: `# Create ${entity} using cURL
curl -X POST "https://api.cloudflip.com/v1/entities/${entity}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${bodyStr}'`,

        filter: `# Filter ${entity} using cURL
curl -X POST "https://api.cloudflip.com/v1/entities/${entity}/filter" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${bodyStr}'`,

        schema: `# Get ${entity} schema using cURL
curl -X GET "https://api.cloudflip.com/v1/entities/${entity}/schema" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`
      }
    };

    return snippets[language]?.[operation] || snippets.javascript[operation];
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-white">SDK Code Snippet</Label>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32 h-8 bg-white/5 border-cyan-500/30 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="curl">cURL</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="h-8 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
      <pre className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 text-cyan-400 text-xs overflow-x-auto max-h-96">
        {generateCode()}
      </pre>
    </div>
  );
}